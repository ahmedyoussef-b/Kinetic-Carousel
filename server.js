// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

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
        origin: "*", 
        methods: ["GET", "POST"]
    }
  });
  
  console.log(`🔌 Le serveur Socket.IO est initialisé sur /api/socket`);

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`⚡️ Nouvelle connexion: ${socket.id} pour l'utilisateur ${userId}`);

    if (typeof userId !== 'string' || !userId) {
        console.warn(`Connexion rejetée: UserID invalide pour le socket ${socket.id}`);
        socket.disconnect();
        return;
    }
    
    onlineUsers.set(socket.id, userId);
    
    const broadcastPresence = () => {
        const uniqueOnlineUsers = Array.from(new Set(onlineUsers.values()));
        io.emit('presence:update', uniqueOnlineUsers);
        console.log(`📡 Diffusion de la présence. ${uniqueOnlineUsers.length} utilisateur(s) en ligne.`, uniqueOnlineUsers);
    }

    broadcastPresence();

    socket.on('presence:online', () => {
        if (!onlineUsers.has(socket.id)) {
            onlineUsers.set(socket.id, userId);
            broadcastPresence();
        }
    });

    socket.on('presence:get', () => {
        const uniqueOnlineUsers = Array.from(new Set(onlineUsers.values()));
        socket.emit('presence:update', uniqueOnlineUsers);
    });
    
    socket.on('session:start', (sessionData) => {
        sessionData.participants.forEach((p) => {
            const socketId = Array.from(onlineUsers.entries()).find(([, uId]) => uId === p.id)?.[0];
            if (socketId) {
                io.to(socketId).emit('session:invite', sessionData);
            }
        });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client déconnecté: ${socket.id}`);
      if (onlineUsers.has(socket.id)) {
          onlineUsers.delete(socket.id);
          broadcastPresence();
      }
    });
  });

  httpServer.on('error', (err) => {
      if ((err as any).code === 'EADDRINUSE') {
        console.error(`❌ Erreur: Le port ${port} est déjà utilisé. Veuillez en choisir un autre.`);
      } else {
        console.error(err);
      }
      process.exit(1);
    });

  httpServer.listen(port, () => {
      console.log(`> Prêt sur http://${hostname}:${port}`);
    });
});
