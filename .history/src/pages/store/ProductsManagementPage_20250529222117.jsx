import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/common/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Settings,
  Eye,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2,
  Copy,
  ExternalLink,
  Zap,
  Globe,
  Timer,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { cn } from '@/lib/utils';

const ProductsManagementPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Form states - ESTRUTURA NOVA (compatível com backend CartPanda)
  const [newProduct, setNewProduct] = useState({
    displayName: '',
    image: '',
    description: '',
    customSteps: []
  });

  // Carregar produtos ao montar componente
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStoreProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      displayName: '',
      image: '',
      description: '',
      customSteps: []
    });
    setImagePreview(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newProduct.displayName.trim()) {
      newErrors.displayName = 'Nome é obrigatório';
    }
    
    if (newProduct.customSteps.length === 0) {
      newErrors.customSteps = 'Adicione pelo menos 1 etapa personalizada';
    }
    
    newProduct.customSteps.forEach((step, index) => {
      if (!step.name.trim()) {
        newErrors[`step_name_${index}`] = 'Nome da etapa é obrigatório';
      }
      if (!step.timeValue || step.timeValue <= 0) {
        newErrors[`step_time_${index}`] = 'Tempo deve ser maior que 0';
      }
      if (!step.timeUnit) {
        newErrors[`step_unit_${index}`] = 'Selecione a unidade de tempo';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FUNÇÃO DE UPLOAD MELHORADA
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Selecione apenas arquivos de imagem' }));
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'A imagem deve ter no máximo 5MB' }));
      return;
    }

    try {
      setIsUploadingImage(true);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });

      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      const response = await apiService.uploadImage(file, 'product');
      
      if (response && response.data && response.data.imageUrl) {
        setNewProduct(prev => ({ ...prev, image: response.data.imageUrl }));
      } else {
        throw new Error('URL da imagem não retornada');
      }

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      setErrors(prev => ({ 
        ...prev, 
        image: error.response?.data?.error || 'Erro ao enviar imagem'
      }));
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setNewProduct(prev => ({ ...prev, image: '' }));
    setImagePreview(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsCreatingProduct(true);
      setErrors({});
      
      // Converter customSteps para formato do backend
      const processedSteps = newProduct.customSteps.map(step => ({
        name: step.name.trim(),
        scheduledFor: `${step.timeValue} ${step.timeUnit}`,
        description: step.description.trim()
      }));
      
      const productData = {
        displayName: newProduct.displayName.trim(),
        image: newProduct.image.trim() || '',
        description: newProduct.description.trim() || '',
        customSteps: processedSteps
      };
      
      const response = await apiService.createProduct(productData);
      
      resetForm();
      setIsAddingProduct(false);
      fetchProducts();
      
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Erro ao criar produto. Tente novamente.'
      });
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      try {
        await apiService.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const addCustomStep = () => {
    setNewProduct(prev => ({
      ...prev,
      customSteps: [
        ...prev.customSteps,
        { 
          name: '', 
          timeValue: 1, 
          timeUnit: 'hours',
          description: '' 
        }
      ]
    }));
    
    // Limpar erro de etapas vazias
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customSteps;
      return newErrors;
    });
  };

  const updateCustomStep = (index, field, value) => {
    setNewProduct(prev => ({
      ...prev,
      customSteps: prev.customSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
    
    // Limpar erros relacionados
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`step_${field}_${index}`];
      return newErrors;
    });
  };

  const removeCustomStep = (index) => {
    setNewProduct(prev => ({
      ...prev,
      customSteps: prev.customSteps.filter((_, i) => i !== index)
    }));
  };

  const copyWebhookUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      // Feedback visual simples
      const button = event.target.closest('button');
      const originalText = button.textContent;
      button.textContent = 'Copiado!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const filteredProducts = products.filter(product => 
    product.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas reais dos produtos
  const totalProducts = products.length;
  const totalSteps = products.reduce((acc, p) => acc + (p.customSteps?.length || 0), 0);
  const productsWithTimeline = products.filter(p => p.customSteps && p.customSteps.length > 0).length;

  if (loading) {
    return (
      <MainLayout userType="store" pageTitle="Produtos">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-gray-500">Carregando produtos...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="store" pageTitle="Gestão de Produtos">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Produtos para E-commerce</h1>
                <p className="text-gray-600">Configure produtos e receba pedidos automaticamente via CartPanda</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Dialog open={isAddingProduct} onOpenChange={(open) => {
                setIsAddingProduct(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  {/* ✅ CORREÇÃO 1: Botão "Novo Produto" com padding e altura adequados */}
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-11 px-6 py-2.5 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                
                {/* 🎨 MODAL MELHORADO - MAIOR E MAIS PROFISSIONAL */}
                <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-2xl">
                      <Package className="h-6 w-6 mr-3 text-purple-600" />
                      Criar Novo Produto
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Configure seu produto para receber pedidos automaticamente via CartPanda
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Erro geral */}
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Erro ao criar produto</p>
                        <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                      </div>
                    </div>
                  )}
                  
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                      <TabsTrigger value="basic" className="text-base">Informações Básicas</TabsTrigger>
                      <TabsTrigger value="steps" className="text-base">Etapas Personalizadas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Coluna 1 - Informações básicas */}
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="displayName" className="text-base font-semibold text-gray-900">
                              Nome do Produto *
                            </Label>
                            <Input
                              id="displayName"
                              value={newProduct.displayName}
                              onChange={(e) => {
                                setNewProduct(prev => ({ ...prev, displayName: e.target.value }));
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.displayName;
                                  return newErrors;
                                });
                              }}
                              placeholder="Ex: Burn Jaro Premium - 6 frascos"
                              className={`mt-2 h-12 text-base ${errors.displayName ? 'border-red-300' : ''}`}
                            />
                            {errors.displayName && (
                              <p className="text-red-600 text-sm mt-2 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.displayName}
                              </p>
                            )}
                            <p className="text-gray-500 text-sm mt-2">Nome que seus clientes verão</p>
                          </div>
                          
                          <div>
                            <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                              Descrição
                            </Label>
                            <Textarea
                              id="description"
                              value={newProduct.description}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Descrição detalhada do produto que aparecerá no acompanhamento..."
                              rows={4}
                              className="mt-2 text-base"
                            />
                            <p className="text-gray-500 text-sm mt-2">Descrição opcional para seus clientes</p>
                          </div>
                        </div>
                        
                        {/* Coluna 2 - Upload de imagem */}
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Imagem do Produto</Label>
                          
                          <div className="mt-4 space-y-6">
                            {/* Preview da imagem */}
                            {(imagePreview || newProduct.image) && (
                              <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 mx-auto">
                                <img 
                                  src={imagePreview || newProduct.image} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            
                            {/* Upload area */}
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                              errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400 bg-gray-50'
                            }`}>
                              <div className="space-y-4">
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isUploadingImage}
                                  />
                                  <div className="flex flex-col items-center">
                                    {isUploadingImage ? (
                                      <Loader2 className="h-16 w-16 text-purple-600 animate-spin mb-4" />
                                    ) : (
                                      <Upload className="h-16 w-16 text-gray-400 mb-4" />
                                    )}
                                    <p className="text-xl font-semibold text-gray-700 mb-2">
                                      {isUploadingImage ? 'Enviando imagem...' : 'Clique para fazer upload'}
                                    </p>
                                    <p className="text-gray-500">
                                      PNG, JPG ou WebP até 5MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {errors.image && (
                              <p className="text-red-600 text-sm flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.image}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex-1 h-px bg-gray-300"></div>
                              <span className="text-gray-500 font-medium">OU</span>
                              <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-700">URL da Imagem</Label>
                              <Input
                                placeholder="https://exemplo.com/produto.jpg"
                                value={newProduct.image}
                                onChange={(e) => {
                                  setNewProduct(prev => ({ ...prev, image: e.target.value }));
                                  setImagePreview(null);
                                }}
                                className="mt-2 h-12"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* 🎯 ETAPAS MELHORADAS COM SELECT DE TEMPO */}
                    <TabsContent value="steps" className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Etapas Personalizadas</h3>
                          <p className="text-gray-600 mt-1">Configure o que o cliente verá no acompanhamento</p>
                          {errors.customSteps && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.customSteps}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={addCustomStep}
                          className="bg-purple-600 hover:bg-purple-700 h-12 px-6"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Etapa
                        </Button>
                      </div>
                      
                      {newProduct.customSteps.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300">
                          <Sparkles className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-3">
                            Nenhuma etapa configurada
                          </h3>
                          <p className="text-gray-500 mb-8 text-lg">
                            Adicione pelo menos 1 etapa para criar seu produto
                          </p>
                          <Button 
                            onClick={addCustomStep}
                            className="bg-purple-600 hover:bg-purple-700 h-12 px-8 text-base"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Criar Primeira Etapa
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {newProduct.customSteps.map((step, index) => (
                            <Card key={index} className="p-6 border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50/30 to-transparent">
                              <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                                      {index + 1}
                                    </div>
                                    <span className="text-xl font-semibold text-purple-700">
                                      Etapa {index + 1}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomStep(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-base font-semibold text-gray-900">
                                      Nome da Etapa *
                                    </Label>
                                    <Input
                                      placeholder="Ex: Separando produtos"
                                      value={step.name}
                                      onChange={(e) => updateCustomStep(index, 'name', e.target.value)}
                                      className={`mt-2 h-12 text-base ${errors[`step_name_${index}`] ? 'border-red-300' : ''}`}
                                    />
                                    {errors[`step_name_${index}`] && (
                                      <p className="text-red-600 text-sm mt-2 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors[`step_name_${index}`]}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <Label className="text-base font-semibold text-gray-900">
                                      Tempo de Execução *
                                    </Label>
                                    <div className="flex space-x-3 mt-2">
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={step.timeValue || ''}
                                        onChange={(e) => updateCustomStep(index, 'timeValue', parseInt(e.target.value) || 1)}
                                        className={`w-24 h-12 text-base ${errors[`step_time_${index}`] ? 'border-red-300' : ''}`}
                                      />
                                      <Select
                                        value={step.timeUnit || 'hours'}
                                        onValueChange={(value) => updateCustomStep(index, 'timeUnit', value)}
                                      >
                                        <SelectTrigger className={`flex-1 h-12 text-base ${errors[`step_unit_${index}`] ? 'border-red-300' : ''}`}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="minutes">Minutos</SelectItem>
                                          <SelectItem value="hours">Horas</SelectItem>
                                          <SelectItem value="days">Dias</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {(errors[`step_time_${index}`] || errors[`step_unit_${index}`]) && (
                                      <p className="text-red-600 text-sm mt-2 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors[`step_time_${index}`] || errors[`step_unit_${index}`]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-base font-semibold text-gray-900">
                                    Descrição para o Cliente
                                  </Label>
                                  <Textarea
                                    placeholder="Descrição opcional que o cliente verá nesta etapa..."
                                    value={step.description}
                                    onChange={(e) => updateCustomStep(index, 'description', e.target.value)}
                                    rows={3}
                                    className="mt-2 text-base"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter className="gap-4 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingProduct(false);
                        resetForm();
                      }}
                      disabled={isCreatingProduct || isUploadingImage}
                      className="h-12 px-8"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateProduct}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 px-8"
                      disabled={isCreatingProduct || isUploadingImage}
                    >
                      {isCreatingProduct ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando Produto...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Criar Produto
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center">
              <Package className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{totalProducts}</p>
                <p className="text-sm text-gray-600">Total Produtos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <Sparkles className="h-8 w-8 text-amber-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{totalSteps}</p>
                <p className="text-sm text-gray-600">Etapas Configuradas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <CheckCircle className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{productsWithTimeline}</p>
                <p className="text-sm text-gray-600">Com Timeline</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Produtos Cadastrados</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {filteredProducts.length} produtos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Tente pesquisar com outros termos' 
                    : 'Comece adicionando seu primeiro produto'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Produto
                  </Button>
                )}
              </div>
            ) : (
              {/* ✅ CORREÇÃO 3: Grid responsivo otimizado com XL breakpoint */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  {/* ✅ CORREÇÃO 2C: Card com hover effects melhorados */}
                  <Card key={product.id} className="hover:shadow-lg transition-all duration-300 group hover:scale-[1.02] bg-white border border-gray-200">
                    {/* ✅ CORREÇÃO 2A: Altura fixa da imagem ao invés de aspect-square */}
                    <div className="h-48 bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center rounded-t-lg overflow-hidden">
                      {product.image ? (
                        {/* ✅ CORREÇÃO 2B: Imagem com hover scale effect */}
                        <img 
                          src={product.image} 
                          alt={product.displayName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <Package className="h-16 w-16 text-purple-300" />
                      )}
                      <div className="hidden w-full h-full items-center justify-center">
                        <Package className="h-16 w-16 text-purple-300" />
                      </div>
                    </div>
                    
                    {/* ✅ CORREÇÃO 2D: Padding do conteúdo otimizado */}
                    <CardContent className="p-5">
                      {/* ✅ CORREÇÃO 2E: Espaçamento entre elementos aumentado */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          {/* ✅ CORREÇÃO 2F: Título com hover color change */}
                          <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-purple-700 transition-colors">{product.displayName}</h3>
                        </div>
                        
                        {product.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-end">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {product.customSteps?.length || 0} etapas
                          </div>
                        </div>
                        
                        {/* ✅ CORREÇÃO 2G: Timeline preview mais compacta e bonita */}
                        {product.customSteps && product.customSteps.length > 0 && (
                          <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                            <p className="text-xs font-medium text-gray-700 mb-1">Timeline:</p>
                            <div className="flex items-center space-x-1 mb-2">
                              {product.customSteps.slice(0, 4).map((_, index) => (
                                <div key={index} className="w-2 h-2 rounded-full bg-purple-400"></div>
                              ))}
                              {product.customSteps.length > 4 && (
                                <span className="text-xs text-gray-500">+{product.customSteps.length - 4}</span>
                              )}
                              <ArrowRight className="h-3 w-3 text-gray-400 ml-1" />
                            </div>
                            <div className="space-y-1">
                              {product.customSteps.slice(0, 3).map((step, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  {index + 1}. {step.name} ({step.scheduledFor})
                                </div>
                              ))}
                              {product.customSteps.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{product.customSteps.length - 3} mais...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Webhook Button */}
                        {product.webhookUrl && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-800">CartPanda Webhook</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyWebhookUrl(product.webhookUrl)}
                                className="h-7 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copiar
                              </Button>
                            </div>
                            <p className="text-xs text-blue-600 mt-1 font-mono truncate">
                              {product.webhookUrl}
                            </p>
                          </div>
                        )}
                        
                        {/* ✅ CORREÇÃO 2H: Botões de ação com espaçamento melhorado */}
                        <div className="flex items-center space-x-2 pt-4 border-t border-gray-100 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProductsManagementPage;