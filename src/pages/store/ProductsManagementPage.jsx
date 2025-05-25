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
  Loader2
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
  
  // Form states - valores iniciais simples
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
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
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      customSteps: []
    });
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Nome e preço são obrigatórios');
      return;
    }

    try {
      setIsCreatingProduct(true);
      
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        storeId: 'store_current_user' // TODO: pegar do contexto do usuário
      };
      
      await apiService.createProduct(productData);
      
      resetForm();
      setIsAddingProduct(false);
      fetchProducts(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto. Tente novamente.');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await apiService.deleteProduct(productId);
        fetchProducts(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  const addCustomStep = () => {
    setNewProduct(prev => ({
      ...prev,
      customSteps: [
        ...prev.customSteps,
        { name: '', scheduledFor: '', description: '' }
      ]
    }));
  };

  const updateCustomStep = (index, field, value) => {
    setNewProduct(prev => ({
      ...prev,
      customSteps: prev.customSteps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeCustomStep = (index) => {
    setNewProduct(prev => ({
      ...prev,
      customSteps: prev.customSteps.filter((_, i) => i !== index)
    }));
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas reais dos produtos (sem valor total)
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
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
                <p className="text-gray-600">Configure produtos e suas etapas de entrega personalizadas</p>
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
              
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                
                {/* Modal MUITO melhorado e responsivo */}
                <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                      <Package className="h-5 w-5 mr-2 text-purple-600" />
                      Novo Produto
                    </DialogTitle>
                    <DialogDescription>
                      Preencha as informações básicas do produto
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                      <TabsTrigger value="steps">Etapas Personalizadas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="name">Nome do Produto *</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Whey Protein Premium"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="price">Preço (R$) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="category">Categoria</Label>
                          <Input
                            id="category"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="Ex: Suplementos"
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descreva seu produto..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <Label htmlFor="imageUrl">URL da Imagem</Label>
                          <Input
                            id="imageUrl"
                            value={newProduct.imageUrl}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="steps" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Etapas Personalizadas</h3>
                          <p className="text-sm text-gray-600">Configure o que o cliente verá no acompanhamento</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCustomStep}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      
                      {newProduct.customSteps.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Sparkles className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>Nenhuma etapa personalizada configurada</p>
                          <p className="text-sm">Adicione etapas para melhorar a experiência do cliente</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {newProduct.customSteps.map((step, index) => (
                            <Card key={index} className="p-3 border-l-4 border-l-purple-400">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-purple-600">
                                    Etapa {index + 1}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustomStep(index)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <Input
                                  placeholder="Nome da etapa"
                                  value={step.name}
                                  onChange={(e) => updateCustomStep(index, 'name', e.target.value)}
                                  className="text-sm"
                                />
                                
                                <Input
                                  placeholder="Tempo (ex: 30 minutes, 2 hours)"
                                  value={step.scheduledFor}
                                  onChange={(e) => updateCustomStep(index, 'scheduledFor', e.target.value)}
                                  className="text-sm"
                                />
                                
                                <Textarea
                                  placeholder="Descrição para o cliente"
                                  value={step.description}
                                  onChange={(e) => updateCustomStep(index, 'description', e.target.value)}
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingProduct(false);
                        resetForm();
                      }}
                      disabled={isCreatingProduct}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateProduct}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      disabled={!newProduct.name || !newProduct.price || isCreatingProduct}
                    >
                      {isCreatingProduct ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Criar Produto'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards - SEM valor total dos produtos */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow group">
                    <div className="aspect-square bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center rounded-t-lg">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-t-lg"
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
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                          {product.category && (
                            <Badge variant="outline" className="text-xs shrink-0 ml-2">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        
                        {product.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        {/* Removido o preço - mostrar apenas info das etapas */}
                        <div className="flex items-center justify-end">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {product.customSteps?.length || 0} etapas
                          </div>
                        </div>
                        
                        {/* Custom Steps Preview */}
                        {product.customSteps && product.customSteps.length > 0 && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 mb-1">Timeline:</p>
                            <div className="flex items-center space-x-1">
                              {product.customSteps.slice(0, 4).map((_, index) => (
                                <div key={index} className="w-2 h-2 rounded-full bg-purple-400"></div>
                              ))}
                              {product.customSteps.length > 4 && (
                                <span className="text-xs text-gray-500">+{product.customSteps.length - 4}</span>
                              )}
                              <ArrowRight className="h-3 w-3 text-gray-400 ml-1" />
                            </div>
                            <div className="mt-1 space-y-1">
                              {product.customSteps.map((step, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  {index + 1}. {step.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
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