// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import prisma from './src/lib/prisma.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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

  io.on('connection', async (socket) => {
    console.log('👤 User connected:', socket.id);

    socket.on('user-online', async (userData) => {
      onlineUsers.set(socket.id, { ...userData, socketId: socket.id });
      try {
        if (userData.id) {
          await prisma.user.update({
            where: { id: userData.id },
            data: { lastSeen: new Date() },
          });
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }
      io.emit('users-online', Array.from(onlineUsers.values()));
    });

    socket.on('send-invitation', async (data) => {
      const { studentSocketId, teacher, sessionData } = data;
      try {
        const session = await prisma.chatroomSession.create({
          data: {
            title: sessionData.title,
            hostId: teacher.id,
            status: 'LIVE',
            startTime: new Date(),
            type: sessionData.type || 'CLASS'
          },
        });
        io.to(studentSocketId).emit('receive-invitation', {
          ...data,
          sessionId: session.id,
        });
      } catch (error) {
        console.error('Error creating session:', error);
      }
    });

    socket.on('invitation-response', async (data) => {
      const { invitation, accepted, student } = data;
      if (accepted) {
        try {
          await prisma.chatroomSession.update({
            where: { id: invitation.sessionId },
            data: {
              participants: {
                create: {
                  userId: student.id,
                }
              },
            },
          });
        } catch (error) {
          console.error('Error adding student to session:', error);
        }
      }
      io.emit('invitation-update', data);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      io.emit('users-online', Array.from(onlineUsers.values()));
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