import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Store, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para registro de loja (simplificado)
  const [formData, setFormData] = useState({
    email: '',
    storeName: '',
    password: '',
    confirmPassword: ''
  });
  
  const { registerStore } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim() || !formData.storeName.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerStore({
        email: formData.email,
        password: formData.password,
        storeName: formData.storeName,
        contactName: '', // Campo opcional vazio
        phone: '' // Campo opcional vazio
      });
      
      toast.success('Loja registrada com sucesso!');
      navigate('/store/dashboard');
    } catch (error) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Erro ao registrar loja. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido. Verifique o formato.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Registrar Loja
              </CardTitle>
              <p className="text-sm text-zinc-600 mt-2">
                Crie sua conta para gerenciar pedidos e chat
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
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="loja@email.com"
                    className="pl-10 h-12 bg-white border-zinc-200 focus:border-purple-400 focus:ring-purple-200 text-base"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Nome da Loja */}
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-sm font-medium text-zinc-700">
                  Nome da Loja *
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="storeName"
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    placeholder="Ex: Minha Loja Online"
                    className="pl-10 h-12 bg-white border-zinc-200 focus:border-purple-400 focus:ring-purple-200 text-base"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Senha *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
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

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                  Confirmar Senha *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Repita a senha"
                    className="pl-10 pr-10 h-12 bg-white border-zinc-200 focus:border-purple-400 focus:ring-purple-200 text-base"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    <Store className="h-5 w-5 mr-2" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-zinc-200">
              <p className="text-sm text-zinc-600">
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info sobre o sistema */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-zinc-800 mb-2">🏪 Para Lojistas</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Após criar sua conta, você poderá adicionar produtos, gerar webhooks 
              e gerenciar o chat pós-venda com seus clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;