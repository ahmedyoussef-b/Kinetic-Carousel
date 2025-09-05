// src/lib/redis.ts
import Redis from 'ioredis';

const redisClientSingleton = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error("❌ [Redis] La variable d'environnement REDIS_URL n'est pas définie.");
    // En développement, on peut retourner un client mock ou null,
    // mais en production, il vaut mieux lancer une erreur.
    throw new Error('La configuration de Redis est manquante.');
  }
  
  console.log("📦 [Redis] Création d'une nouvelle connexion client...");
  return new Redis(redisUrl);
}

declare global {
  var redis: undefined | ReturnType<typeof redisClientSingleton>
}

const redis = globalThis.redis ?? redisClientSingleton()

export default redis

if (process.env.NODE_ENV !== 'production') {
  globalThis.redis = redis
}
