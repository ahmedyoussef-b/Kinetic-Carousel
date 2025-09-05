
// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import prisma from './src/lib/prisma';
import { Role } from './src/types/index.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const onlineUsers = new Map<string, string>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://your-netlify-app.netlify.app']
        : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
    },
  });


  const broadcastPresence = () => {
    const onlineUserIds = Array.from(onlineUsers.keys());
    io.emit('presence:update', onlineUserIds);
  };


  io.on('connection', async (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        onlineUsers.set(userId, socket.id);
        broadcastPresence();
    }
    
    socket.on('presence:get', () => {
        socket.emit('presence:update', Array.from(onlineUsers.keys()));
    });
    
    socket.on('student:present', (studentId: string) => {
        io.emit('student:signaled_presence', studentId);
    });

    socket.on('session:start', async (sessionData) => {
        if (!sessionData.participants || sessionData.participants.length === 0) return;

        sessionData.participants.forEach((participant: { role: Role; userId: string; }) => {
            if (participant.role === Role.STUDENT || participant.role === Role.TEACHER) {
                const targetSocketId = onlineUsers.get(participant.userId);
                if (targetSocketId) {
                    io.to(targetSocketId).emit('session:invite', sessionData);
                }
            }
        });
    });


    socket.on('disconnect', () => {
      let disconnectedUserId: string | null = null;
      for (const [key, value] of onlineUsers.entries()) {
          if (value === socket.id) {
              disconnectedUserId = key;
              break;
          }
      }

      if (disconnectedUserId) {
          onlineUsers.delete(disconnectedUserId);
          broadcastPresence();
      }
    });
  });


  httpServer.on('error', (err) => {
    console.error('❌ HTTP Server Error:', err);
    if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      console.error(`❌ Error: Port ${port} is already in use. Please choose another one.`);
    }
    process.exit(1);
  });

  httpServer.listen(port, hostname, () => {
    console.log(`✅ Server is ready and listening on http://${hostname}:${port}`);
  });
  
  // Graceful shutdown logic
  const cleanup = async () => {
    io.close(); // Close Socket.IO connections
    await prisma.$disconnect();
    httpServer.close(() => {
        process.exit(0);
    });
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
});
