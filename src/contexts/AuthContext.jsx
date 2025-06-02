// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  // ✅ USUÁRIOS DE TESTE - APENAS LOJAS
  const testUsers = {
    // ✅ EMAIL REAL DA LOJA
    'gmpartners00@gmail.com': {
      role: 'store',
      name: 'Loja Teste Rafael',
      email: 'gmpartners00@gmail.com'
    },
    // ✅ LOJA DE TESTE CRIADA
    'loja-teste-rafael@teste.com': {
      role: 'store',
      name: 'Loja Teste Rafael',
      email: 'loja-teste-rafael@teste.com'
    }
    // ❌ REMOVIDO: Clientes não fazem mais login
  };

  // Função para limpar completamente o estado
  const clearAuthState = () => {
    setUser(null);
    setUserProfile(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeName');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerId');
    console.log('🧹 Estado de autenticação completamente limpo');
  };

  // Monitorar estado de autenticação
  useEffect(() => {
    console.log('🔧 Iniciando monitoramento de autenticação...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Estado de auth mudou:', firebaseUser ? firebaseUser.email : 'DESLOGADO');
      
      if (firebaseUser) {
        try {
          // Obter token JWT
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);
          setUser(firebaseUser);
          
          // Salvar token no localStorage para o apiService
          localStorage.setItem('authToken', token);
          
          // IMPORTANTE: Verificar se é uma loja
          try {
            const storeDoc = await getDoc(doc(db, 'stores', firebaseUser.uid));
            
            if (storeDoc.exists()) {
              // É uma loja
              const storeData = storeDoc.data();
              const profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: 'store',
                name: storeData.storeName || storeData.name || 'Loja',
                storeName: storeData.storeName,
                logoUrl: storeData.logoUrl,
                status: storeData.status
              };
              
              setUserProfile(profile);
              
              // Salvar no localStorage
              localStorage.setItem('userType', 'store');
              localStorage.setItem('storeId', firebaseUser.uid);
              localStorage.setItem('storeName', profile.storeName);
              
              console.log('✅ Loja autenticada:', profile);
            } else {
              // Não é uma loja - verificar se é um usuário de teste
              const testProfile = testUsers[firebaseUser.email];
              
              if (testProfile && testProfile.role === 'store') {
                // É uma loja de teste
                const finalProfile = {
                  ...testProfile,
                  uid: firebaseUser.uid
                };
                
                setUserProfile(finalProfile);
                
                // Salvar no localStorage
                localStorage.setItem('userType', 'store');
                localStorage.setItem('storeId', firebaseUser.uid);
                localStorage.setItem('storeName', finalProfile.name);
                
                console.log('✅ Loja de teste autenticada:', finalProfile);
              } else {
                // Não é loja - não permitir acesso
                console.log('❌ Usuário não é uma loja - limpando estado');
                await signOut(auth);
                clearAuthState();
              }
            }
          } catch (error) {
            console.error('❌ Erro ao verificar loja:', error);
            clearAuthState();
          }
          
        } catch (error) {
          console.error('❌ Erro na autenticação:', error);
          clearAuthState();
        }
      } else {
        // Usuário deslogou - LIMPAR TUDO
        console.log('🚪 Usuário deslogado - limpando estado');
        clearAuthState();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login - focado em lojas
  const login = async (email, password) => {
    try {
      console.log('🔐 Tentando login:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login realizado:', userCredential.user.email);
      
      // O resto da verificação será feito pelo onAuthStateChanged
      return userCredential.user;
      
    } catch (error) {
      console.log('❌ Erro no login:', error.code, error.message);
      throw error;
    }
  };

  // Registro de Loja
  const registerStore = async (storeData) => {
    try {
      console.log('📝 Registrando store:', storeData.email);
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        storeData.email,
        storeData.password
      );
      
      const user = userCredential.user;
      
      // Criar documento na collection stores
      await setDoc(doc(db, 'stores', user.uid), {
        uid: user.uid,
        email: storeData.email,
        storeName: storeData.storeName,
        ownerName: storeData.ownerName || '',
        phone: storeData.phone || '',
        status: 'active',
        role: 'store',
        userType: 'store',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Loja registrada com sucesso');
      
      return user;
    } catch (error) {
      console.error('❌ Erro ao registrar loja:', error);
      
      // Se a API falhar, criar apenas no Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email já está em uso');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Senha muito fraca');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      }
      
      throw error;
    }
  };

  // Registro de Cliente - REMOVIDO pois clientes não fazem login
  const registerCustomer = async (customerData) => {
    throw new Error('Clientes não precisam de registro. Use a consulta de pedidos por email.');
  };

  // Logout
  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      
      // Limpar estado local primeiro
      clearAuthState();
      
      // Fazer signOut do Firebase
      await signOut(auth);
      
      // Limpar localStorage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Logout realizado com sucesso');
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, garantir limpeza local
      clearAuthState();
      localStorage.clear();
      sessionStorage.clear();
      
      return true;
    }
  };

  const value = {
    user,
    userProfile,
    authToken,
    loading,
    isAuthenticated: !!user,
    isCustomer: false, // Clientes não fazem login
    isStore: userProfile?.role === 'store',
    login,
    registerCustomer, // Mantido por compatibilidade mas lança erro
    registerStore,
    logout,
    clearAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};