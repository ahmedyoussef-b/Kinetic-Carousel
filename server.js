// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

// Correction pour importer un module CommonJS/TS dans un environnement ES Module
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const prisma = require('./src/lib/prisma').default;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const onlineUsers = new Map(); // In-memory store for online users: socket.id -> userId

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
  });
  
  console.log('🔌 Socket.IO server initialized on /api/socket');

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`⚡️ New connection: ${socket.id} for user ${userId}`);

    if (typeof userId !== 'string') {
        socket.disconnect();
        return;
    }
    
    onlineUsers.set(socket.id, userId);
    
    // Function to broadcast presence updates
    const broadcastPresence = () => {
        io.emit('presence:update', Array.from(onlineUsers.values()));
    }

    // Initial presence update
    broadcastPresence();

    socket.on('presence:online', () => {
        if (!onlineUsers.has(socket.id)) {
            onlineUsers.set(socket.id, userId);
            broadcastPresence();
        }
    });
    
    socket.on('presence:get', () => {
        socket.emit('presence:update', Array.from(onlineUsers.values()));
    });
    
    // Session events
    socket.on('session:start', (sessionData) => {
        // Here you would notify participants
        sessionData.participants.forEach(p => {
            const socketId = Array.from(onlineUsers.entries()).find(([, uId]) => uId === p.id)?.[0];
            if (socketId) {
                io.to(socketId).emit('session:invite', sessionData);
            }
        });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      onlineUsers.delete(socket.id);
      broadcastPresence();
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
