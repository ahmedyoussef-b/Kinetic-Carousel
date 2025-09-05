// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import prisma from './src/lib/prisma.js';
import { Role } from './src/types/index.js'; // Assurez-vous que ce chemin est correct

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Map pour suivre les utilisateurs en ligne : { userId: socket.id }
const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://your-netlify-app.netlify.app'] // Add your production URL here
        : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
    },
  });

  console.log(`🔌 Socket.IO server initialized at /api/socket`);

  const broadcastPresence = () => {
    const onlineUserIds = Array.from(onlineUsers.keys());
    console.log(`📡 [Presence] Broadcasting presence update. Online users: ${onlineUserIds.length}`);
    io.emit('presence:update', onlineUserIds);
  };


  io.on('connection', async (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`👤 User connected: ${userId} with socket ID: ${socket.id}. Total online: ${onlineUsers.size}`);
        broadcastPresence();

        // Mettre à jour lastSeen dans la BDD
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { lastSeen: new Date() },
            });
        } catch (error) {
            console.error(`Error updating lastSeen for user ${userId}:`, error);
        }
    } else {
        console.warn(`⚠️ User connected without a userId.`);
    }
    
    // Demande initiale de présence par un client (ex: un professeur qui vient de se connecter)
    socket.on('presence:get', () => {
        socket.emit('presence:update', Array.from(onlineUsers.keys()));
    });
    
    // Un élève signale activement sa présence
    socket.on('student:present', (studentId) => {
        console.log(`✋ [Signal] Student ${studentId} signaled presence.`);
        // Transférer ce signal à tous les clients (le professeur l'interceptera)
        io.emit('student:signaled_presence', studentId);
    });

    // Un professeur démarre une session et notifie les participants
    socket.on('session:start', async (sessionData) => {
        console.log(`🚀 [Session] Starting session "${sessionData.title}"`);
        if (!sessionData.participants || sessionData.participants.length === 0) return;

        sessionData.participants.forEach((participant) => {
            if (participant.role === Role.STUDENT || participant.role === Role.TEACHER) {
                const targetSocketId = onlineUsers.get(participant.userId);
                if (targetSocketId) {
                    console.log(`📬 [Session] Sending invite for session ${sessionData.id} to user ${participant.userId} on socket ${targetSocketId}`);
                    io.to(targetSocketId).emit('session:invite', sessionData);
                } else {
                    console.log(`[Session] User ${participant.userId} is not online. Skipping invite.`);
                }
            }
        });
    });


    socket.on('disconnect', () => {
      // Retrouver le userId basé sur le socket.id
      let disconnectedUserId = null;
      for (const [key, value] of onlineUsers.entries()) {
          if (value === socket.id) {
              disconnectedUserId = key;
              break;
          }
      }

      if (disconnectedUserId) {
          onlineUsers.delete(disconnectedUserId);
          console.log(`👋 User disconnected: ${disconnectedUserId}. Total online: ${onlineUsers.size}`);
          broadcastPresence();
      } else {
           console.log(`👋 Socket ${socket.id} disconnected, but was not associated with a userId.`);
      }
    });
  });


  httpServer.on('error', (err) => {
    if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      console.error(`❌ Error: Port ${port} is already in use. Please choose another one.`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
