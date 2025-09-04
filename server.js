// server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Stocke la correspondance entre l'ID de socket et l'ID de l'utilisateur.
const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
        origin: "*", // Pour la production, il est recommandé de restreindre à votre domaine.
        methods: ["GET", "POST"]
    }
  });
  
  console.log('🔌 Le serveur Socket.IO est initialisé sur /api/socket');

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`⚡️ Nouvelle connexion: ${socket.id} pour l'utilisateur ${userId}`);

    if (typeof userId !== 'string' || !userId) {
        console.warn(`Connexion rejetée: UserID invalide pour le socket ${socket.id}`);
        socket.disconnect();
        return;
    }
    
    // Ajouter l'utilisateur à la liste des utilisateurs en ligne.
    onlineUsers.set(socket.id, userId);
    
    // Fonction pour diffuser la liste mise à jour des utilisateurs uniques en ligne.
    const broadcastPresence = () => {
        const uniqueOnlineUsers = Array.from(new Set(onlineUsers.values()));
        io.emit('presence:update', uniqueOnlineUsers);
        console.log(`📡 Diffusion de la présence. ${uniqueOnlineUsers.length} utilisateur(s) en ligne.`, uniqueOnlineUsers);
    }

    // Diffuser la mise à jour à toutes les connexions, y compris la nouvelle.
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
        // Notifier les participants spécifiques d'une invitation à une session.
        sessionData.participants.forEach((p) => {
             // Trouver le socket.id pour un userId donné.
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
          // Diffuser la mise à jour après une déconnexion.
          broadcastPresence();
      }
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Prêt sur http://localhost:${port}`);
  });
});
