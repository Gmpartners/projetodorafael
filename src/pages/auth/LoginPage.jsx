import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff, Store, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, logout } = useAuth();
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
      console.log('🔐 Fazendo login para:', email);
      
      // Fazer login
      const firebaseUser = await login(email, password);
      
      // Verificar se é uma loja válida
      console.log('🔍 Verificando loja...');
      
      const storeDoc = await getDoc(doc(db, 'stores', firebaseUser.uid));
      
      if (!storeDoc.exists()) {
        console.log('❌ Não é uma loja válida');
        await logout();
        setError('Email ou senha incorretos. Verifique suas credenciais.');
        setPassword('');
        return;
      }
      
      const storeData = storeDoc.data();
      
      // Verificar se a loja está ativa
      if (storeData.status !== 'active') {
        console.log('❌ Loja inativa');
        await logout();
        setError('Esta loja está inativa. Entre em contato com o suporte.');
        return;
      }
      
      console.log('✅ Login realizado com sucesso!');
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar direto para o dashboard
      navigate('/store/dashboard', { replace: true });
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      let errorMessage = 'Email ou senha incorretos. Tente novamente.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
      }
      
      setError(errorMessage);
      setPassword(''); // Limpar senha em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Função para ir ao lookup de cliente
  const goToCustomerLookup = () => {
    navigate('/customer/lookup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Track Your Order
              </CardTitle>
              <p className="text-sm text-zinc-600 mt-2">
                Acesso exclusivo para lojistas
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
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
                    className="pl-10 h-12 bg-white border-zinc-200 focus:border-blue-400 focus:ring-blue-200 text-base"
                    disabled={loading}
                    autoComplete="email"
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
                    className="pl-10 pr-10 h-12 bg-white border-zinc-200 focus:border-blue-400 focus:ring-blue-200 text-base"
                    disabled={loading}
                    autoComplete="current-password"
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
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base font-semibold shadow-lg mt-6"
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

            {/* Link de ajuda */}
            <div className="text-center pt-2">
              <a 
                href="#" 
                className="text-sm text-indigo-600 hover:text-indigo-700"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Entre em contato: suporte@trackyourorder.com');
                }}
              >
                Esqueceu sua senha?
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Informações extras - simplificada */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-zinc-800 mb-2">ℹ️ Acesso Rápido</h3>
            <div className="space-y-2 text-xs text-zinc-600">
              <p>
                <strong className="text-blue-700">🏪 Lojistas:</strong> Email e senha para gerenciar pedidos
              </p>
              <p>
                <strong className="text-green-700">🛍️ Clientes:</strong> Apenas email para consultar pedidos
              </p>
            </div>
          </div>
        </div>

        {/* Login da loja de teste */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 text-center">
            <strong>🧪 Loja de teste:</strong> loja-teste-rafael@teste.com | senha: teste123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;