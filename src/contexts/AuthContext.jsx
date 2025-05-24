// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiService } from '@/services/apiService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obter token JWT
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);
          setUser(firebaseUser);
          
          // Buscar perfil do usuário na API
          const profile = await apiService.getUserProfile(token);
          setUserProfile(profile);
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
          setUser(null);
          setUserProfile(null);
          setAuthToken(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setAuthToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Registro de Cliente
  const registerCustomer = async (customerData) => {
    try {
      // Primeiro registrar no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        customerData.email, 
        customerData.password
      );

      // Depois registrar via API
      await apiService.registerCustomer(customerData);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Registro de Loja
  const registerStore = async (storeData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        storeData.email, 
        storeData.password
      );

      await apiService.registerStore(storeData);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    authToken,
    loading,
    isAuthenticated: !!user,
    isCustomer: userProfile?.role === 'customer',
    isStore: userProfile?.role === 'store',
    login,
    registerCustomer,
    registerStore,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};