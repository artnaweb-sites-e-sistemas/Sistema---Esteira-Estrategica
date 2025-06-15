import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          photoURL: firebaseUser.photoURL || undefined
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Verificar resultado de redirect (para login com Google)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Login com Google via redirect bem-sucedido');
        }
      })
      .catch((error) => {
        console.error('Erro no redirect do Google:', error);
      });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
        photoURL: firebaseUser.photoURL || undefined
      };
      
      return userData;
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Tentar popup primeiro
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;
        
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          photoURL: firebaseUser.photoURL || undefined
        };
        
        return userData;
      } catch (popupError: any) {
        console.log('Popup falhou, tentando redirect:', popupError.code);
        
        // Se popup falhar, usar redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          await signInWithRedirect(auth, googleProvider);
          // O resultado será tratado no useEffect via getRedirectResult
          return null;
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      throw new Error(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Atualizar o perfil com o nome
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name,
        photoURL: firebaseUser.photoURL || undefined
      };
      
      return userData;
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw new Error(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Limpar dados específicos do usuário
      localStorage.removeItem('darkMode');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout
  };
};

// Função para traduzir códigos de erro do Firebase
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique o e-mail ou crie uma conta.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso. Tente fazer login ou use outro e-mail.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'E-mail inválido. Verifique o formato do e-mail.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';
    case 'auth/popup-closed-by-user':
      return 'Login cancelado. Tente novamente.';
    case 'auth/popup-blocked':
      return 'Pop-up bloqueado. Tentando método alternativo...';
    case 'auth/cancelled-popup-request':
      return 'Solicitação de login cancelada.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    case 'auth/internal-error':
      return 'Erro interno. Tente novamente em alguns instantes.';
    case 'auth/invalid-action-code':
      return 'Código de ação inválido. Tente fazer login novamente.';
    case 'auth/operation-not-allowed':
      return 'Login com Google não está habilitado. Entre em contato com o suporte.';
    default:
      console.log('Código de erro não mapeado:', errorCode);
      return 'Erro de autenticação. Tente novamente.';
  }
};