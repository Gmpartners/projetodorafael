// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyChzG6hDW0hKlkMzFG8oKcWAnRMldGiWro",
  authDomain: "projeto-rafael-53f73.firebaseapp.com", 
  projectId: "projeto-rafael-53f73",
  storageBucket: "projeto-rafael-53f73.firebasestorage.app",
  messagingSenderId: "572769248919",
  appId: "1:572769248919:web:4b4d4e829098246baeebd2",
  measurementId: "G-HGKQ3P6RWJ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging (apenas se suportado)
export const messaging = isSupported() ? getMessaging(app) : null;

export default app;