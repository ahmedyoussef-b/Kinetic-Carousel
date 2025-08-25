// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

console.log("🔥 [Firebase Init] Chargement de la configuration Firebase...");

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fonction pour vérifier si la configuration est valide
function isConfigValid(config: FirebaseOptions): boolean {
  return !!config.apiKey && !!config.projectId;
}

export function initializeFirebaseApp() {
    console.log("🔥 [Firebase Init] Tentative d'initialisation de l'application Firebase...");
    if (getApps().length) {
        console.log("🔥 [Firebase Init] ✅ Application déjà initialisée. Retour de l'instance existante.");
        return getApp();
    }

    if (isConfigValid(firebaseConfig)) {
        console.log("🔥 [Firebase Init] ✅ Configuration valide. Initialisation d'une nouvelle application.");
        return initializeApp(firebaseConfig);
    } else {
        console.error("🔥 [Firebase Init] ❌ Configuration Firebase invalide ou manquante. Vérifiez vos variables d'environnement.");
        throw new Error("La configuration de Firebase est manquante ou invalide.");
    }
}

export const app = initializeFirebaseApp();
export const auth = getAuth(app);
