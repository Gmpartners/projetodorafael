import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/common/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { cn } from '@/lib/utils';

const CustomModal = ({ isOpen, onClose, children, maxWidth = "1200px" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className="relative bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={{ 
          width: '90vw', 
          maxWidth: maxWidth,
          maxHeight: '90vh',
          margin: '2rem'
        }}
      >
        {children}
      </div>
    </div>
  );
};

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
  
  const [viewingProduct, setViewingProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  
  const [newProduct, setNewProduct] = useState({
    displayName: '',
    image: '',
    description: '',
    customSteps: []
  });

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
    setActiveTab('basic');
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
      
      const timeValue = Number(step.timeValue);
      if (!timeValue || timeValue <= 0) {
        newErrors[`step_time_${index}`] = 'Tempo deve ser maior que 0';
      }
      
      if (!step.timeUnit) {
        newErrors[`step_unit_${index}`] = 'Selecione a unidade de tempo';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Selecione apenas arquivos de imagem' }));
      return;
    }

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

  const handleUpdateProduct = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsUpdatingProduct(true);
      setErrors({});
      
      const processedSteps = newProduct.customSteps.map(step => ({
        name: step.name.trim(),
        scheduledFor: `${Number(step.timeValue)} ${step.timeUnit}`,
        description: step.description.trim()
      }));
      
      const productData = {
        displayName: newProduct.displayName.trim(),
        image: newProduct.image.trim() || '',
        description: newProduct.description.trim() || '',
        customSteps: processedSteps
      };
      
      await apiService.updateProduct(editingProduct.id, productData);
      
      resetForm();
      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
      
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Erro ao atualizar produto. Tente novamente.'
      });
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      try {
        setLoadingStates(prev => ({ ...prev, [productId]: 'deleting' }));
        await apiService.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, [productId]: null }));
      }
    }
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    
    const formattedSteps = (product.customSteps || []).map((step) => {
      let timeValue = 1;
      let timeUnit = 'hours';
      
      if (step.timeValue && step.timeUnit) {
        timeValue = Number(step.timeValue) || 1;
        timeUnit = step.timeUnit || 'hours';
      } 
      else if (step.scheduledFor && typeof step.scheduledFor === 'string') {
        const parts = step.scheduledFor.trim().split(' ');
        
        if (parts.length >= 2) {
          const parsedValue = Number(parts[0]);
          if (!isNaN(parsedValue) && parsedValue > 0) {
            timeValue = parsedValue;
            timeUnit = parts[1];
          }
        }
      }
      
      return {
        name: step.name || '',
        timeValue: timeValue,
        timeUnit: timeUnit,
        description: step.description || ''
      };
    });
    
    setNewProduct({
      displayName: product.displayName || '',
      image: product.image || '',
      description: product.description || '',
      customSteps: formattedSteps
    });
    
    setImagePreview(product.image || null);
    setActiveTab('basic');
    setIsEditModalOpen(true);
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
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-purple-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Produtos para E-commerce</h1>
                <p className="text-sm sm:text-base text-gray-600">Configure produtos e receba pedidos automaticamente via CartPanda</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>
              
              <Button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-10 sm:h-11 px-4 sm:px-6 py-2.5 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Novo Produto</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalProducts}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Produtos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalSteps}</p>
                <p className="text-xs sm:text-sm text-gray-600">Etapas Configuradas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{productsWithTimeline}</p>
                <p className="text-xs sm:text-sm text-gray-600">Com Timeline</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg sm:text-xl">Produtos Cadastrados</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-all duration-300 group hover:scale-[1.02] bg-white border border-gray-200 flex flex-col">
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center rounded-t-lg overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.displayName}
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-purple-300" />
                      )}
                      <div className="hidden w-full h-full items-center justify-center">
                        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-purple-300" />
                      </div>
                    </div>
                    
                    <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                      <div className="flex-1 space-y-3 sm:space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-base sm:text-lg leading-tight text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">{product.displayName}</h3>
                        </div>
                        
                        {product.description && (
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-end">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {product.customSteps?.length || 0} etapas
                          </div>
                        </div>
                        
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
                                  {index + 1}. {step.name}
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
                      </div>
                        
                      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-9 text-xs sm:text-sm"
                          disabled={loadingStates[product.id] === 'editing'}
                          onClick={() => handleEditProduct(product)}
                        >
                          {loadingStates[product.id] === 'editing' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Edit className="h-3 w-3 mr-1" />
                          )}
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-9 text-xs sm:text-sm"
                          onClick={() => handleViewProduct(product)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={loadingStates[product.id] === 'deleting'}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                        >
                          {loadingStates[product.id] === 'deleting' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CustomModal 
          isOpen={isAddingProduct} 
          onClose={() => {
            setIsAddingProduct(false);
            resetForm();
          }}
          maxWidth="1000px"
        >
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Criar Novo Produto
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure seu produto para receber pedidos via CartPanda
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingProduct(false);
                    resetForm();
                  }}
                  className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {errors.general && (
              <div className="flex-shrink-0 bg-red-50 border border-red-200 mx-6 mt-4 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Erro ao criar produto</p>
                  <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 mb-6">
                  <div className="flex border-b border-gray-200">
                    <button 
                      className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'basic' 
                          ? 'border-purple-500 text-purple-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('basic')}
                    >
                      📋 Informações Básicas
                    </button>
                    <button 
                      className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'steps' 
                          ? 'border-purple-500 text-purple-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('steps')}
                    >
                      ⚡ Etapas Personalizadas
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[60vh]">
                  {activeTab === 'basic' && (
                    <div className="space-y-6 pr-2 pb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div>
                            <Label className="text-base font-semibold text-gray-900 flex items-center mb-3">
                              <Package className="h-4 w-4 mr-2 text-purple-600" />
                              Nome do Produto *
                            </Label>
                            <Input
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
                              className={`h-12 ${errors.displayName ? 'border-red-300 bg-red-50' : ''}`}
                            />
                            {errors.displayName && (
                              <p className="text-red-600 text-sm mt-2 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.displayName}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-base font-semibold text-gray-900 flex items-center mb-3">
                              <Edit className="h-4 w-4 mr-2 text-purple-600" />
                              Descrição
                            </Label>
                            <Textarea
                              value={newProduct.description}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Descrição do produto..."
                              rows={4}
                              className="resize-none"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-base font-semibold text-gray-900 flex items-center mb-4">
                            <ImageIcon className="h-4 w-4 mr-2 text-purple-600" />
                            Imagem do Produto
                          </Label>
                          
                          <div className="space-y-4">
                            {(imagePreview || newProduct.image) && (
                              <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-purple-200 bg-purple-50 mx-auto">
                                <img 
                                  src={imagePreview || newProduct.image} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            
                            <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              errors.image ? 'border-red-300 bg-red-50' : 'border-purple-300 hover:border-purple-400 bg-purple-50/30'
                            }`}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploadingImage}
                              />
                              <div className="flex flex-col items-center">
                                {isUploadingImage ? (
                                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
                                ) : (
                                  <Upload className="h-8 w-8 text-purple-400 mb-2" />
                                )}
                                <p className="text-sm font-medium text-gray-700">
                                  {isUploadingImage ? 'Enviando...' : 'Clique para fazer upload'}
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                              </div>
                            </div>
                            
                            {errors.image && (
                              <p className="text-red-600 text-sm flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.image}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'steps' && (
                    <div className="space-y-6 pr-2 pb-4">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                            Etapas Personalizadas
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">Configure as etapas do produto</p>
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
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                      
                      {newProduct.customSteps.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Nenhuma etapa configurada
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Adicione pelo menos 1 etapa personalizada
                          </p>
                          <Button 
                            onClick={addCustomStep}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Etapa
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {newProduct.customSteps.map((step, index) => (
                            <Card key={index} className="p-4 border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50/50 to-transparent">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                      {index + 1}
                                    </div>
                                    <span className="text-lg font-semibold text-purple-700">
                                      Etapa {index + 1}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomStep(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                      Nome da Etapa *
                                    </Label>
                                    <Input
                                      placeholder="Ex: Separando produtos"
                                      value={step.name}
                                      onChange={(e) => updateCustomStep(index, 'name', e.target.value)}
                                      className={errors[`step_name_${index}`] ? 'border-red-300 bg-red-50' : ''}
                                    />
                                    {errors[`step_name_${index}`] && (
                                      <p className="text-red-600 text-xs mt-1 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors[`step_name_${index}`]}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                      Tempo de Execução *
                                    </Label>
                                    <div className="flex space-x-2">
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={step.timeValue || ''}
                                        onChange={(e) => updateCustomStep(index, 'timeValue', parseInt(e.target.value) || 1)}
                                        className={`w-20 ${errors[`step_time_${index}`] ? 'border-red-300 bg-red-50' : ''}`}
                                      />
                                      <Select
                                        value={step.timeUnit || 'hours'}
                                        onValueChange={(value) => updateCustomStep(index, 'timeUnit', value)}
                                      >
                                        <SelectTrigger className={`flex-1 ${errors[`step_unit_${index}`] ? 'border-red-300 bg-red-50' : ''}`}>
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
                                      <p className="text-red-600 text-xs mt-1 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors[`step_time_${index}`] || errors[`step_unit_${index}`]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                    Descrição para o Cliente
                                  </Label>
                                  <Textarea
                                    placeholder="Descrição opcional..."
                                    value={step.description}
                                    onChange={(e) => updateCustomStep(index, 'description', e.target.value)}
                                    rows={2}
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gradient-to-r from-gray-50 to-purple-50 flex items-center justify-end gap-4">
              <Button 
                onClick={() => {
                  setIsAddingProduct(false);
                  resetForm();
                }}
                disabled={isCreatingProduct || isUploadingImage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProduct}
                disabled={isCreatingProduct || isUploadingImage}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreatingProduct ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Criar Produto
                  </>
                )}
              </Button>
            </div>
          </div>
        </CustomModal>

        <CustomModal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)}
          maxWidth="1000px"
        >
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {viewingProduct?.displayName}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Visualização completa do produto
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pb-8">
              {viewingProduct && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border-2 border-blue-100 overflow-hidden">
                        {viewingProduct.image ? (
                          <img 
                            src={viewingProduct.image} 
                            alt={viewingProduct.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-blue-300" />
                        )}
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">Nome do Produto</h3>
                          <p className="text-gray-900 font-medium">{viewingProduct.displayName}</p>
                        </div>
                        
                        {viewingProduct.description && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Descrição</h3>
                            <p className="text-gray-700">{viewingProduct.description}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            {viewingProduct.customSteps?.length || 0} etapas
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Ativo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {viewingProduct.customSteps && viewingProduct.customSteps.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Timeline de Etapas</h2>
                          <p className="text-sm text-gray-600">{viewingProduct.customSteps.length} etapas configuradas</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {viewingProduct.customSteps.map((step, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/50 to-transparent">
                            <div className="flex items-start space-x-4">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{step.name}</h4>
                                    <p className="text-sm text-blue-600 font-medium mt-1">
                                      ⏱️ {step.scheduledFor}
                                    </p>
                                  </div>
                                </div>
                                {step.description && (
                                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <p className="text-sm text-gray-700 italic">"{step.description}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewingProduct.webhookUrl && (
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Integração CartPanda</h2>
                          <p className="text-sm text-gray-600">URL do webhook para receber pedidos</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <Globe className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Webhook Ativo</span>
                            </div>
                            <p className="text-sm text-green-600 font-mono break-all bg-white px-3 py-2 rounded border">
                              {viewingProduct.webhookUrl}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => copyWebhookUrl(viewingProduct.webhookUrl)}
                            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gradient-to-r from-gray-50 to-blue-50 flex items-center justify-end gap-4">
              <Button 
                onClick={() => setIsViewModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400"
              >
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditProduct(viewingProduct);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </CustomModal>

        <CustomModal 
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
            setEditingProduct(null);
          }}
          maxWidth="1000px"
        >
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Edit className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Editar Produto
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Atualize as informações do produto
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingProduct(null);
                  }}
                  className="rounded-full h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {errors.general && (
              <div className="flex-shrink-0 bg-red-50 border border-red-200 mx-6 mt-4 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Erro ao atualizar produto</p>
                  <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 mb-6">
                  <div className="flex border-b border-gray-200">
                    <button 
                      className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'basic' 
                          ? 'border-orange-500 text-orange-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('basic')}
                    >
                      📋 Informações Básicas
                    </button>
                    <button 
                      className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'steps' 
                          ? 'border-orange-500 text-orange-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('steps')}
                    >
                      ⚡ Etapas Personalizadas
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[60vh]">
                  {activeTab === 'basic' && (
                    <div className="space-y-6 pr-2 pb-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div>
                            <Label className="text-base font-semibold text-gray-900 flex items-center mb-3">
                              <Package className="h-4 w-4 mr-2 text-orange-600" />
                              Nome do Produto *
                            </Label>
                            <Input
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
                              className={`h-12 ${errors.displayName ? 'border-red-300 bg-red-50' : ''}`}
                            />
                            {errors.displayName && (
                              <p className="text-red-600 text-sm mt-2 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.displayName}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-base font-semibold text-gray-900 flex items-center mb-3">
                              <Edit className="h-4 w-4 mr-2 text-orange-600" />
                              Descrição
                            </Label>
                            <Textarea
                              value={newProduct.description}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Descrição do produto..."
                              rows={4}
                              className="resize-none"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-base font-semibold text-gray-900 flex items-center mb-4">
                            <ImageIcon className="h-4 w-4 mr-2 text-orange-600" />
                            Imagem do Produto
                          </Label>
                          
                          <div className="space-y-4">
                            {(imagePreview || newProduct.image) && (
                              <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-orange-200 bg-orange-50 mx-auto">
                                <img 
                                  src={imagePreview || newProduct.image} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            
                            <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              errors.image ? 'border-red-300 bg-red-50' : 'border-orange-300 hover:border-orange-400 bg-orange-50/30'
                            }`}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploadingImage}
                              />
                              <div className="flex flex-col items-center">
                                {isUploadingImage ? (
                                  <Loader2 className="h-8 w-8 text-orange-600 animate-spin mb-2" />
                                ) : (
                                  <Upload className="h-8 w-8 text-orange-400 mb-2" />
                                )}
                                <p className="text-sm font-medium text-gray-700">
                                  {isUploadingImage ? 'Enviando...' : 'Clique para alterar'}
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                              </div>
                            </div>
                            
                            {errors.image && (
                              <p className="text-red-600 text-sm flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.image}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'steps' && (
                    <div className="space-y-6 pr-2 pb-4">
                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
                            Etapas Personalizadas
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">Configure as etapas do produto</p>
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
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                      
                      {newProduct.customSteps.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Nenhuma etapa configurada
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Adicione pelo menos 1 etapa personalizada
                          </p>
                          <Button 
                            onClick={addCustomStep}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Etapa
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {newProduct.customSteps.map((step, index) => (
                            <Card key={index} className="p-4 border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50/50 to-transparent">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                      {index + 1}
                                    </div>
                                    <span className="text-lg font-semibold text-orange-700">
                                      Etapa {index + 1}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomStep(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                      Nome da Etapa *
                                    </Label>
                                    <Input
                                      placeholder="Ex: Separando produtos"
                                      value={step.name}
                                      onChange={(e) => updateCustomStep(index, 'name', e.target.value)}
                                      className={errors[`step_name_${index}`] ? 'border-red-300 bg-red-50' : ''}
                                    />
                                    {errors[`step_name_${index}`] && (
                                      <p className="text-red-600 text-xs mt-1 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors[`step_name_${index}`]}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                      Tempo de Execução *
                                    </Label>
                                    <div className="flex space-x-2">
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={step.timeValue}
                                        onChange={(e) => updateCustomStep(index, 'timeValue', parseInt(e.target.value) || 1)}
                                        className={`w-20 ${errors[`step_time_${index}`] ? 'border-red-300 bg-red-50' : ''}`}
                                      />
                                      <Select
                                        value={step.timeUnit || 'hours'}
                                        onValueChange={(value) => updateCustomStep(index, 'timeUnit', value)}
                                      >
                                        <SelectTrigger className={`flex-1 ${errors[`step_unit_${index}`] ? 'border-red-300 bg-red-50' : ''}`}>
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
                                      <p className="text-red-600 text-xs mt-1 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {errors[`step_time_${index}`] || errors[`step_unit_${index}`]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium text-gray-900 mb-2 block">
                                    Descrição para o Cliente
                                  </Label>
                                  <Textarea
                                    placeholder="Descrição opcional..."
                                    value={step.description}
                                    onChange={(e) => updateCustomStep(index, 'description', e.target.value)}
                                    rows={2}
                                    className="resize-none"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gradient-to-r from-gray-50 to-orange-50 flex items-center justify-end gap-4">
              <Button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                  setEditingProduct(null);
                }}
                disabled={isUpdatingProduct || isUploadingImage}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateProduct}
                disabled={isUpdatingProduct || isUploadingImage}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUpdatingProduct ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </CustomModal>
      </div>
    </MainLayout>
  );
};

export default ProductsManagementPage;