import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { 
  PaletteIcon,
  CheckIcon,
  Loader2,
  ImageIcon,
  RectangleHorizontalIcon,
  SquareIcon,
  BellIcon
} from 'lucide-react';

const StoreBrandingCard = () => {
  const [loading, setLoading] = useState(false);
  const [brandingData, setBrandingData] = useState({
    logoUrl: null,
    bannerUrl: null,
    faviconUrl: null,
    primaryColor: '#2196F3',
    secondaryColor: '#FF5722',
    textColor: '#212121',
    backgroundColor: '#FFFFFF'
  });
  const [uploadingType, setUploadingType] = useState(null);

  useEffect(() => {
    loadBrandingSettings();
  }, []);

  const loadBrandingSettings = async () => {
    try {
      const settings = await apiService.getBrandingSettings();
      setBrandingData(settings.data || brandingData);
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
    }
  };

  const handleImageUpload = async (type, file) => {
    if (!file) return;

    setUploadingType(type);
    try {
      let result;
      
      switch(type) {
        case 'logo':
          result = await apiService.uploadLogo(file);
          break;
        case 'banner':
          result = await apiService.uploadBanner(file);
          break;
        case 'favicon':
          result = await apiService.uploadFavicon(file);
          break;
      }

      if (result.success) {
        toast.success(`${type} atualizado com sucesso!`);
        await loadBrandingSettings();
      }
    } catch (error) {
      toast.error(`Erro ao fazer upload do ${type}`);
    } finally {
      setUploadingType(null);
    }
  };

  const handleUpdateColors = async () => {
    setLoading(true);
    try {
      await apiService.updateBrandingColors({
        primaryColor: brandingData.primaryColor,
        secondaryColor: brandingData.secondaryColor,
        textColor: brandingData.textColor,
        backgroundColor: brandingData.backgroundColor
      });
      
      toast.success('Cores atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar cores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 border-0 shadow-premium">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-lg">
          <PaletteIcon className="h-6 w-6 text-indigo-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Personalização Visual da Loja</h3>
          <p className="text-zinc-600">Configure logo, cores e branding das notificações</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-zinc-800 mb-4">Imagens da Marca</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Logo Principal (256x256)</Label>
              <div className="relative group">
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-indigo-400 transition-colors h-32 flex items-center justify-center bg-zinc-50">
                  {brandingData.logoUrl ? (
                    <img 
                      src={brandingData.logoUrl} 
                      alt="Logo" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-zinc-400 mx-auto" />
                      <p className="text-xs text-zinc-500 mt-1">Logo da loja</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('logo', e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingType === 'logo'}
                />
                {uploadingType === 'logo' && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500">Ícone principal da notificação</p>
            </div>

            <div className="space-y-2">
              <Label>Banner (600x300)</Label>
              <div className="relative group">
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-indigo-400 transition-colors h-32 flex items-center justify-center bg-zinc-50">
                  {brandingData.bannerUrl ? (
                    <img 
                      src={brandingData.bannerUrl} 
                      alt="Banner" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <RectangleHorizontalIcon className="h-8 w-8 text-zinc-400 mx-auto" />
                      <p className="text-xs text-zinc-500 mt-1">Banner promocional</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('banner', e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingType === 'banner'}
                />
                {uploadingType === 'banner' && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500">Imagem grande expandida</p>
            </div>

            <div className="space-y-2">
              <Label>Favicon (64x64)</Label>
              <div className="relative group">
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-indigo-400 transition-colors h-32 flex items-center justify-center bg-zinc-50">
                  {brandingData.faviconUrl ? (
                    <img 
                      src={brandingData.faviconUrl} 
                      alt="Favicon" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <SquareIcon className="h-8 w-8 text-zinc-400 mx-auto" />
                      <p className="text-xs text-zinc-500 mt-1">Ícone pequeno</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('favicon', e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingType === 'favicon'}
                />
                {uploadingType === 'favicon' && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500">Badge da notificação</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-800 mb-4">Paleta de Cores</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Cor Primária</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brandingData.primaryColor}
                  onChange={(e) => setBrandingData({...brandingData, primaryColor: e.target.value})}
                  className="h-10 w-16 rounded border border-zinc-300 cursor-pointer"
                />
                <Input 
                  value={brandingData.primaryColor}
                  onChange={(e) => setBrandingData({...brandingData, primaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor Secundária</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brandingData.secondaryColor}
                  onChange={(e) => setBrandingData({...brandingData, secondaryColor: e.target.value})}
                  className="h-10 w-16 rounded border border-zinc-300 cursor-pointer"
                />
                <Input 
                  value={brandingData.secondaryColor}
                  onChange={(e) => setBrandingData({...brandingData, secondaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Texto</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brandingData.textColor}
                  onChange={(e) => setBrandingData({...brandingData, textColor: e.target.value})}
                  className="h-10 w-16 rounded border border-zinc-300 cursor-pointer"
                />
                <Input 
                  value={brandingData.textColor}
                  onChange={(e) => setBrandingData({...brandingData, textColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brandingData.backgroundColor}
                  onChange={(e) => setBrandingData({...brandingData, backgroundColor: e.target.value})}
                  className="h-10 w-16 rounded border border-zinc-300 cursor-pointer"
                />
                <Input 
                  value={brandingData.backgroundColor}
                  onChange={(e) => setBrandingData({...brandingData, backgroundColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleUpdateColors}
            disabled={loading}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Salvar Cores
              </>
            )}
          </Button>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-800 mb-4">Preview da Notificação Personalizada</h4>
          <div className="bg-zinc-100 rounded-lg p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                {brandingData.logoUrl ? (
                  <img src={brandingData.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg" />
                ) : (
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: brandingData.primaryColor }}
                  >
                    <BellIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h5 className="font-semibold" style={{ color: brandingData.textColor }}>
                    Nova Promoção Disponível!
                  </h5>
                  <p className="text-sm mt-1" style={{ color: brandingData.textColor + '99' }}>
                    Aproveite 50% de desconto em produtos selecionados
                  </p>
                  {brandingData.bannerUrl && (
                    <img 
                      src={brandingData.bannerUrl} 
                      alt="Banner" 
                      className="mt-2 rounded w-full h-24 object-cover"
                    />
                  )}
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: brandingData.primaryColor + '20',
                        color: brandingData.primaryColor,
                        borderColor: brandingData.primaryColor
                      }}
                    >
                      Sua Loja
                    </Badge>
                    <span className="text-xs text-zinc-400">• Agora</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default StoreBrandingCard;