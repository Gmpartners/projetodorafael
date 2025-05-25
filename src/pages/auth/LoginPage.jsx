import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff, Store, User, LogOut, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, logout, isAuthenticated, userProfile, user } = useAuth();
  const navigate = useNavigate();

  // REMOVIDO o useEffect que causava redirecionamento automático

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Tentando login para:', email);
      await login(email, password);
      
      toast.success('Login realizado com sucesso!');
      console.log('✅ Login bem sucedido, redirecionando...');
      
      // Redirecionamento manual baseado no email (mais confiável)
      setTimeout(() => {
        if (email === 'maria.customer@teste.com') {
          console.log('👤 Redirecionando para customer dashboard');
          navigate('/customer/dashboard');
        } else if (email === 'gmpartners00@gmail.com' || email === 'teste@loja.com') {
          console.log('🏪 Redirecionando para store dashboard');
          navigate('/store/dashboard');
        } else {
          // Fallback para outros usuários
          console.log('🤔 Email não reconhecido, usando userProfile');
          // Aguardar um pouco para userProfile carregar
          setTimeout(() => {
            if (userProfile?.role === 'customer') {
              navigate('/customer/dashboard');
            } else {
              navigate('/store/dashboard');
            }
          }, 1000);
        }
      }, 1500); // Aguardar 1.5 segundos para garantir que tudo carregou
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado. Verifique o email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta. Tente novamente.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido. Verifique o formato.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Fazendo logout...');
      await logout();
      
      // Limpar campos do formulário
      setEmail('');
      setPassword('');
      setError('');
      
      toast.success('Logout realizado! Pode logar com outro usuário.');
      console.log('✅ Logout completo - pronto para novo login');
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO ATUALIZADA - Login rápido como LOJA com email real
  const handleStoreLogin = async () => {
    console.log('🏪 Login rápido como loja');
    setEmail('gmpartners00@gmail.com'); // ✅ EMAIL REAL DA LOJA
    setPassword('123456789');
    setError('');
    
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 500);
  };

  // Função para login rápido como CUSTOMER  
  const handleCustomerLogin = async () => {
    console.log('👤 Login rápido como customer');
    setEmail('maria.customer@teste.com');
    setPassword('123456789');
    setError('');
    
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 500);
  };

  // Função para ir para dashboard do usuário logado (apenas quando clicado manualmente)
  const goToDashboard = () => {
    console.log('🎯 Ir para dashboard manualmente, userProfile:', userProfile);
    
    if (userProfile?.role === 'store') {
      navigate('/store/dashboard');
    } else if (userProfile?.role === 'customer') {
      navigate('/customer/dashboard');
    } else {
      console.warn('⚠️ Role não identificado:', userProfile);
      toast.error('Erro: tipo de usuário não identificado');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Portal Rafael
              </CardTitle>
              <p className="text-sm text-zinc-600 mt-2">
                Sistema de comunicação pós-venda
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status do usuário atual - APENAS informativo, sem redirecionamento automático */}
            {isAuthenticated && userProfile && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Usuário atual:</strong> {userProfile.name || user.email}<br/>
                      <span className="text-sm">
                        Tipo: {userProfile.role === 'store' ? '🏪 Loja' : userProfile.role === 'customer' ? '👤 Cliente' : `❓ ${userProfile.role}`}
                      </span><br/>
                      <span className="text-xs text-amber-600">
                        Faça logout para trocar de usuário ou clique para ir ao dashboard
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={goToDashboard}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Dashboard
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleLogout}
                        disabled={loading}
                        className="border-amber-300 text-amber-800 hover:bg-amber-100"
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 h-12 bg-white border-zinc-200 focus:border-purple-400 focus:ring-purple-200 text-base"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pl-10 pr-10 h-12 bg-white border-zinc-200 focus:border-purple-400 focus:ring-purple-200 text-base"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-base font-semibold shadow-lg mt-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Botões de teste rápido */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-600 mb-3">🔄 Trocar de Usuário:</p>
              </div>
              
              <Button 
                type="button"
                variant="outline"
                onClick={handleStoreLogin}
                className="w-full h-11 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                disabled={loading}
              >
                <Store className="h-4 w-4 mr-2" />
                🏪 Login como LOJA
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={handleCustomerLogin}
                className="w-full h-11 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                disabled={loading}
              >
                <User className="h-4 w-4 mr-2" />
                👤 Login como CUSTOMER
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-zinc-500 mt-2">
                  ✨ Pode alternar entre usuários no mesmo navegador!
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-zinc-600">
                Ainda não tem uma conta?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ✅ INFO ATUALIZADA - Com email real da loja */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50">
          <div className="text-center mb-3">
            <h3 className="text-sm font-semibold text-zinc-800">🔄 Teste de Alternância</h3>
            <p className="text-xs text-zinc-600">
              Sistema permite alternar entre usuários no mesmo navegador
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <Store className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-zinc-800">Loja</h4>
              <p className="text-xs text-zinc-600">gmpartners00@gmail.com</p>
            </div>
            <div>
              <User className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-zinc-800">Cliente</h4>
              <p className="text-xs text-zinc-600">maria.customer@teste.com</p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-zinc-200 text-center">
            <p className="text-xs text-zinc-500">
              <strong>Senha para ambos:</strong> 123456789
            </p>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
          Status: {isAuthenticated ? '✅ Logado' : '❌ Deslogado'} | 
          Role: {userProfile?.role || 'N/A'} | 
          User: {user?.email || 'N/A'} | 
          Loading: {loading ? '⏳' : '✅'}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;