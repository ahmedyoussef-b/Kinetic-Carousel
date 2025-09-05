// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import prisma from './lib/prisma.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const onlineUsers = new Map(); // Stores socket.id -> { userData, socketId }

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

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    const userId = socket.handshake.auth.userId;

    if (userId) {
      onlineUsers.set(userId, { socketId: socket.id, userId: userId });
      console.log(`[Connection] User ${userId} is now online with socket ${socket.id}`);
      io.emit('presence:update', Array.from(onlineUsers.keys()));
    }

    socket.on('user:online', async (userData) => {
        if (userData && userData.id) {
            onlineUsers.set(userData.id, { ...userData, socketId: socket.id });
            console.log(`[user:online] User ${userData.id} is now online.`);
            try {
                await prisma.user.update({
                    where: { id: userData.id },
                    data: { lastSeen: new Date() },
                });
            } catch (error) {
                console.error('Error updating user status:', error);
            }
            io.emit('presence:update', Array.from(onlineUsers.keys()));
        }
    });

    socket.on('student:present', (studentId) => {
        console.log(`✋ [Server] Student ${studentId} signaled presence.`);
        io.emit('student:signaled_presence', studentId);
    });

    socket.on('session:start', (sessionData) => {
        console.log(`[Server] Session started: ${sessionData.id}. Notifying participants.`);
        sessionData.participants.forEach((participant) => {
            const onlineUser = onlineUsers.get(participant.userId);
            if (onlineUser) {
                console.log(`  -> Sending invite to ${participant.name} at socket ${onlineUser.socketId}`);
                io.to(onlineUser.socketId).emit('session:invite', sessionData);
            } else {
                console.log(`  -> Participant ${participant.name} is offline.`);
            }
        });
    });

    socket.on('disconnect', () => {
      const disconnectedUserId = Array.from(onlineUsers.entries())
        .find(([, data]) => data.socketId === socket.id)?.[0];

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        console.log(`[Disconnect] User ${disconnectedUserId} disconnected. Socket ${socket.id} removed.`);
        io.emit('presence:update', Array.from(onlineUsers.keys()));
      }
      console.log('👋 User disconnected:', socket.id);
    });
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
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
