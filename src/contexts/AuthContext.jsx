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

  // ✅ USUÁRIOS DE TESTE ATUALIZADOS COM EMAILS REAIS
  const testUsers = {
    // ✅ EMAIL REAL DA LOJA
    'gmpartners00@gmail.com': {
      role: 'store',
      name: 'Loja Teste Rafael',
      email: 'gmpartners00@gmail.com'
    },
    // ✅ COMPATIBILIDADE - Caso consiga criar teste@loja.com no futuro
    'teste@loja.com': {
      role: 'store',
      name: 'Loja Teste Rafael', 
      email: 'teste@loja.com'
    },
    // ✅ CLIENTE MARIA
    'maria.customer@teste.com': {
      role: 'customer', 
      name: 'Maria Silva',
      email: 'maria.customer@teste.com',
      phone: '(11) 99999-9999',
      customerId: 'customer_maria_silva_456',
      relatedStoreId: 'E47OkrK3IcNu1Ys8gD4CA29RrHk2'
    }
  };

  // Função para limpar completamente o estado
  const clearAuthState = () => {
    setUser(null);
    setUserProfile(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
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
          
          // Verificar se é um usuário de teste IMEDIATAMENTE
          const testProfile = testUsers[firebaseUser.email];
          
          if (testProfile) {
            // Usar perfil de teste - definir IMEDIATAMENTE
            // ✅ CORREÇÃO: Usar o UID real do Firebase em vez do hardcoded
            const finalProfile = {
              ...testProfile,
              uid: firebaseUser.uid  // ← USAR O UID REAL DO FIREBASE
            };
            
            console.log('⚡ Definindo perfil de teste imediatamente:', finalProfile);
            setUserProfile(finalProfile);
            setLoading(false); // Terminar loading imediatamente para usuários de teste
            
            console.log('✅ Usuário de teste autenticado:', {
              uid: finalProfile.uid,
              email: firebaseUser.email,
              role: finalProfile.role,
              profile: finalProfile
            });
          } else {
            // Buscar perfil real da API
            try {
              const profile = await apiService.getUserProfile(token);
              setUserProfile(profile);
              console.log('✅ Perfil real carregado da API:', profile);
            } catch (error) {
              console.error('Erro ao buscar perfil:', error);
              // Fallback para usuários não cadastrados na API
              const fallbackProfile = {
                role: 'customer', // Default para customer
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email
              };
              setUserProfile(fallbackProfile);
              console.log('⚠️ Usando perfil fallback:', fallbackProfile);
            }
            setLoading(false); // Terminar loading após buscar perfil real
          }
          
        } catch (error) {
          console.error('❌ Erro na autenticação:', error);
          clearAuthState();
          setLoading(false);
        }
      } else {
        // Usuário deslogou - LIMPAR TUDO COMPLETAMENTE
        console.log('🚪 Usuário deslogado - limpando estado');
        clearAuthState();
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Login MELHORADO - criar usuário automaticamente se não existir
  const login = async (email, password) => {
    try {
      console.log('🔐 Tentando login:', email);
      
      // Primeiro, tentar login direto
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Login direto bem-sucedido:', userCredential.user.email);
        return userCredential.user;
      } catch (loginError) {
        console.log('⚠️ Login direto falhou:', loginError.code);
        
        // Se for usuário de teste e não existir, criar automaticamente
        if (loginError.code === 'auth/user-not-found' && testUsers[email]) {
          console.log('🔧 Criando usuário de teste automaticamente...');
          
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ Usuário de teste criado e logado:', userCredential.user.email);
            console.log('🆔 UID real gerado:', userCredential.user.uid);
            return userCredential.user;
          } catch (createError) {
            console.error('❌ Erro ao criar usuário de teste:', createError);
            throw createError;
          }
        } else {
          // Para outros erros, repassar o erro original
          throw loginError;
        }
      }
      
    } catch (error) {
      console.log('❌ Erro no login:', error.code, error.message);
      throw error;
    }
  };

  // Registro de Cliente
  const registerCustomer = async (customerData) => {
    try {
      console.log('📝 Registrando customer:', customerData.email);
      // Tentar registrar via API primeiro
      await apiService.registerCustomer(customerData);
      
      // Fazer login automático
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        customerData.email, 
        customerData.password
      );
      
      return userCredential.user;
    } catch (error) {
      // Se a API falhar, registrar apenas no Firebase Auth
      console.warn('⚠️ API de registro falhou, criando apenas no Firebase Auth');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        customerData.email,
        customerData.password
      );
      return userCredential.user;
    }
  };

  // Registro de Loja
  const registerStore = async (storeData) => {
    try {
      console.log('📝 Registrando store:', storeData.email);
      // Tentar registrar via API primeiro
      await apiService.registerStore(storeData);
      
      // Fazer login automático
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        storeData.email, 
        storeData.password
      );
      
      return userCredential.user;
    } catch (error) {
      // Se a API falhar, registrar apenas no Firebase Auth
      console.warn('⚠️ API de registro falhou, criando apenas no Firebase Auth');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        storeData.email,
        storeData.password
      );
      return userCredential.user;
    }
  };

  // Logout SUPER COMPLETO - garante limpeza total
  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout COMPLETO...');
      
      // 1. Primeiro limpar o estado local IMEDIATAMENTE
      clearAuthState();
      
      // 2. Fazer signOut do Firebase
      await signOut(auth);
      
      // 3. Garantir limpeza adicional
      localStorage.clear(); // Limpar TUDO do localStorage
      sessionStorage.clear(); // Limpar TUDO do sessionStorage
      
      console.log('✅ Logout COMPLETAMENTE realizado - pronto para novo login');
      
      // 4. NÃO forçar redirecionamento - deixar o usuário na página atual
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, garantir limpeza local
      clearAuthState();
      localStorage.clear();
      sessionStorage.clear();
      
      // Não dar throw para não quebrar a UI
      console.log('⚠️ Logout forçado mesmo com erro');
      return true;
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
    logout,
    // Informações extras para teste
    testUsers,
    clearAuthState // Expor função de limpeza para debug
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};