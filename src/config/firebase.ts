import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEpoG7mtlrkwrTGZ5-xckuwxsUG57YyVw",
  authDomain: "artnaweb---dashboard-de-funis.firebaseapp.com",
  projectId: "artnaweb---dashboard-de-funis",
  storageBucket: "artnaweb---dashboard-de-funis.firebasestorage.app",
  messagingSenderId: "233592315931",
  appId: "1:233592315931:web:57731e8ea453e5049598be",
  measurementId: "G-C8VT8M5K0L"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

// Inicializar Analytics apenas se estiver no browser
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Configurar provedor do Google com configurações específicas
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: undefined // Remove restrição de domínio
});

// Adicionar escopos necessários
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;