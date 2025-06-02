import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff, Store, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, logout, isAuthenticated, userProfile, user } = useAuth();
  const navigate = useNavigate();

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
      
      // Fazer login primeiro
      const firebaseUser = await login(email, password);
      
      // IMPORTANTE: Verificar se é uma loja
      console.log('🔍 Verificando se é uma loja...');
      
      try {
        const storeDoc = await getDoc(doc(db, 'stores', firebaseUser.uid));
        
        if (!storeDoc.exists()) {
          // NÃO É UMA LOJA - fazer logout e mostrar erro
          console.log('❌ Não é uma loja - negando acesso');
          await logout();
          
          setError('Esta área é exclusiva para lojistas. Clientes devem acessar através da consulta de pedidos.');
          toast.error('Acesso negado - área exclusiva para lojas', {
            description: 'Clique no botão abaixo para acessar como cliente'
          });
          
          // Limpar campos
          setPassword('');
          
          return; // Interromper o processo
        }
        
        const storeData = storeDoc.data();
        
        // Verificar se a loja está ativa
        if (storeData.status !== 'active') {
          console.log('❌ Loja inativa');
          await logout();
          setError('Esta loja está inativa. Entre em contato com o suporte.');
          return;
        }
        
        console.log('✅ Loja válida e ativa:', storeData.storeName);
        
      } catch (firestoreError) {
        console.error('❌ Erro ao verificar loja:', firestoreError);
        await logout();
        setError('Erro ao verificar permissões. Tente novamente.');
        return;
      }
      
      // Se chegou aqui, é uma loja válida
      toast.success('Login realizado com sucesso!');
      console.log('✅ Redirecionando para dashboard da loja...');
      
      // Aguardar um pouco para garantir que tudo foi carregado
      setTimeout(() => {
        navigate('/store/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email não cadastrado. Verifique se você tem uma conta de loja.';
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
      
      toast.success('Logout realizado!');
      console.log('✅ Logout completo');
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  // Função para ir ao lookup de cliente
  const goToCustomerLookup = () => {
    navigate('/customer/lookup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Portal Rafael - Área do Lojista
              </CardTitle>
              <p className="text-sm text-zinc-600 mt-2">
                Acesso exclusivo para lojas parceiras
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status do usuário atual - apenas para lojas */}
            {isAuthenticated && userProfile && userProfile.role === 'store' && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Logado como:</strong> {userProfile.name || user.email}<br/>
                      <span className="text-sm">
                        🏪 Loja ativa
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/store/dashboard')}
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
                  Email da Loja
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="loja@exemplo.com"
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
                    Entrar como Lojista
                  </>
                )}
              </Button>
            </form>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500">Cliente?</span>
              </div>
            </div>

            {/* Botão para área do cliente */}
            <Button 
              type="button"
              variant="outline"
              onClick={goToCustomerLookup}
              className="w-full h-11 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
              disabled={loading}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Sou Cliente - Consultar Pedidos
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-zinc-600">
                Ainda não tem uma loja cadastrada?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Cadastrar minha loja
                </Link>
              </p>
            </div>

            {/* Link de ajuda */}
            <div className="text-center">
              <a 
                href="#" 
                className="text-sm text-indigo-600 hover:text-indigo-700"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Entre em contato: suporte@rafaellobo.com');
                }}
              >
                Esqueceu sua senha?
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Informações extras */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-zinc-800 mb-2">ℹ️ Informações Importantes</h3>
            <div className="space-y-2 text-xs text-zinc-600">
              <p>
                <strong className="text-purple-700">🏪 Lojistas:</strong> Faça login com email e senha para gerenciar pedidos e conversar com clientes
              </p>
              <p>
                <strong className="text-green-700">🛍️ Clientes:</strong> Consulte seus pedidos apenas com o email (sem necessidade de senha)
              </p>
            </div>
          </div>
        </div>

        {/* Login da loja de teste */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-800 text-center">
            <strong>🧪 Loja de teste:</strong> loja-teste-rafael@teste.com | senha: teste123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;