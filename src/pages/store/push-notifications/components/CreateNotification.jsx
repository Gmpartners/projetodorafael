import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  PlusIcon,
  SendIcon,
  CalendarIcon,
  ImageIcon,
  TrashIcon,
  LinkIcon,
  EyeIcon,
  BellIcon,
  Loader2,
  Upload,
  Sparkles,
  X,
  MousePointer
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CreateNotification = () => {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState('subscribers');
  const [targetUserId, setTargetUserId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🆕 v7.3: Estados para URL personalizada (sem validação via API)
  const [customUrl, setCustomUrl] = useState('');
  
  // 🆕 v7.3: Sistema de botões personalizados livre
  const [customButtons, setCustomButtons] = useState([]);
  const [newButtonTitle, setNewButtonTitle] = useState('');
  const [newButtonAction, setNewButtonAction] = useState('');

  // Estados para imagens personalizadas
  const [customIcon, setCustomIcon] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 🆕 v7.3: Adicionar novo botão personalizado
  const addCustomButton = () => {
    if (!newButtonTitle.trim()) {
      toast.error('Digite o texto do botão');
      return;
    }

    const newButton = {
      title: newButtonTitle.trim(),
      action: newButtonAction.trim() || `action_${Date.now()}`, // Gera action automática se não fornecida
      icon: null // Pode adicionar suporte a ícones depois
    };

    setCustomButtons([...customButtons, newButton]);
    setNewButtonTitle('');
    setNewButtonAction('');
    toast.success('Botão adicionado!');
  };

  // 🆕 v7.3: Remover botão personalizado
  const removeCustomButton = (index) => {
    setCustomButtons(customButtons.filter((_, i) => i !== index));
    toast.success('Botão removido');
  };

  // Upload de imagem para Firebase Storage
  const uploadImage = async (file, type) => {
    if (!file) return null;
    
    console.log('📤 Iniciando upload:', { fileName: file.name, type, size: file.size });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', type);
    
    try {
      const result = await apiService.uploadStoreImage(formData);
      console.log('✅ Upload concluído:', result);
      
      const imageUrl = result.data?.imageUrl || result.imageUrl || result.data?.url || result.url;
      console.log('🔗 URL extraída:', imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast.error(`Erro ao fazer upload da ${type}: ${error.message}`);
      return null;
    }
  };

  const handleIconSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo muito grande. Máximo 2MB');
      return;
    }

    setUploadingIcon(true);
    toast.info('📤 Fazendo upload do logo...');
    
    try {
      const uploadedUrl = await uploadImage(file, 'notification_logo');
      
      if (uploadedUrl) {
        setCustomIcon(uploadedUrl);
        toast.success('✅ Logo enviado com sucesso!');
      } else {
        toast.error('Erro: URL da imagem não foi retornada');
      }
    } catch (error) {
      console.error('❌ Erro no handleIconSelect:', error);
      toast.error('Erro no upload do logo');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    setUploadingImage(true);
    toast.info('📤 Fazendo upload da imagem...');
    
    try {
      const uploadedUrl = await uploadImage(file, 'notification_image');
      
      if (uploadedUrl) {
        setCustomImage(uploadedUrl);
        toast.success('✅ Imagem enviada com sucesso!');
      } else {
        toast.error('Erro: URL da imagem não foi retornada');
      }
    } catch (error) {
      console.error('❌ Erro no handleImageSelect:', error);
      toast.error('Erro no upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveIcon = () => {
    setCustomIcon(null);
    const iconInput = document.getElementById('notification-logo');
    if (iconInput) iconInput.value = '';
    toast.success('Logo removido');
  };

  const handleRemoveImage = () => {
    setCustomImage(null);
    const imageInput = document.getElementById('notification-image');
    if (imageInput) imageInput.value = '';
    toast.success('Imagem removida');
  };

  const handleLabelClick = (type) => {
    const input = document.getElementById(`notification-${type}`);
    if (input) input.click();
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Preencha título e mensagem');
      return;
    }

    if (targetType === 'subscribers' && !scheduledDate) {
      if (!confirm(`Confirma o envio imediato para TODOS os usuários inscritos?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      console.log('📤 Enviando notificação v7.3 (simplificada)...');

      const baseNotificationData = {
        title: title.trim(),
        body: body.trim(),
        type: 'custom',
        // 🆕 v7.3: URL personalizada sem validação via API
        data: {
          type: 'custom',
          timestamp: new Date().toISOString(),
          source: 'manual_creation_v7_3',
          ...(customUrl && { url: customUrl })
        },
        // 🆕 v7.3: Botões totalmente personalizados
        ...(customButtons.length > 0 && { actions: customButtons }),
        requireInteraction: true,
        vibrate: [200, 100, 200]
      };

      // Incluir imagens personalizadas
      if (customIcon) {
        baseNotificationData.icon = customIcon;
      }
      
      if (customImage) {
        baseNotificationData.image = customImage;
      }

      if (scheduledDate) {
        const notificationData = {
          ...baseNotificationData,
          scheduledDate: new Date(scheduledDate).toISOString()
        };

        const result = await apiService.createNotification(notificationData);
        console.log('✅ Notificação v7.3 agendada:', result);
        
        toast.success('📅 Notificação agendada com sucesso!', {
          description: `Será enviada em ${new Date(scheduledDate).toLocaleString()}`
        });
      } else {
        // Envio imediato
        const result = await apiService.sendImmediateNotification({
          ...baseNotificationData,
          target: targetType,
          ...(targetType === 'user' && targetUserId && { targetId: targetUserId }),
          data: {
            ...baseNotificationData.data,
            ...(customUrl && { link: customUrl })
          }
        });
        
        console.log('✅ Notificação v7.3 enviada:', result);
        
        toast.success('🚀 Notificação enviada com sucesso!', {
          description: `${customButtons.length} botões personalizados`
        });
      }
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação v7.3:', error);
      toast.error('❌ Erro ao enviar notificação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset do formulário
  const resetForm = () => {
    setTitle('');
    setBody('');
    setTargetUserId('');
    setScheduledDate('');
    setCustomUrl('');
    setCustomIcon(null);
    setCustomImage(null);
    setCustomButtons([]);
    setNewButtonTitle('');
    setNewButtonAction('');
    
    // Limpar inputs de arquivo
    const iconInput = document.getElementById('notification-logo');
    const imageInput = document.getElementById('notification-image');
    if (iconInput) iconInput.value = '';
    if (imageInput) imageInput.value = '';
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
              <Sparkles className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Criar Notificação v7.3</h3>
              <p className="text-zinc-600">Crie notificações com botões totalmente personalizados</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Destinatário */}
            <div className="space-y-2">
              <Label htmlFor="target">Destinatário</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o destinatário..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscribers">👥 Todos os Inscritos</SelectItem>
                  <SelectItem value="user">👤 Usuário Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="targetUserId">ID do Usuário</Label>
                <Input
                  id="targetUserId"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Ex: 0HeRINZTlvOM5raS8J4AkITanWP2"
                />
              </div>
            )}

            {/* Título e Mensagem */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="title">Título da Notificação</Label>
                <span className={cn(
                  "text-xs",
                  title.length > 40 ? "text-red-500 font-semibold" : "text-zinc-500"
                )}>
                  {title.length}/50 {title.length > 40 && "⚠️"}
                </span>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nova promoção disponível!"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="body">Mensagem</Label>
                <span className={cn(
                  "text-xs",
                  body.length > 140 ? "text-red-500 font-semibold" : "text-zinc-500"
                )}>
                  {body.length}/160 {body.length > 140 && "⚠️"}
                </span>
              </div>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Digite a mensagem da notificação..."
                rows={3}
                maxLength={160}
              />
            </div>

            {/* 🆕 v7.3: URL Personalizada (sem validação via API) */}
            <div className="space-y-2">
              <Label htmlFor="customUrl">URL Personalizada (Opcional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="customUrl"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://exemplo.com/promocao"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Deixe vazio para usar URL padrão do dashboard
              </p>
            </div>

            {/* 🆕 v7.3: Sistema de Botões Personalizados */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">🎯 Botões Personalizados</Label>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-blue-800 font-medium">
                  Adicione até 2 botões personalizados na notificação
                </p>
                
                {/* Formulário para adicionar novo botão */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Input
                      placeholder="Texto do botão"
                      value={newButtonTitle}
                      onChange={(e) => setNewButtonTitle(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="ID da ação (opcional)"
                      value={newButtonAction}
                      onChange={(e) => setNewButtonAction(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      onClick={addCustomButton}
                      disabled={!newButtonTitle.trim() || customButtons.length >= 2}
                      className="w-full"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Lista de botões adicionados */}
                {customButtons.length > 0 && (
                  <div className="space-y-2">
                    {customButtons.map((button, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-blue-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MousePointer className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900">{button.title}</p>
                            <p className="text-xs text-blue-600">Ação: {button.action}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomButton(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-blue-600">
                  💡 Os botões aparecerão na notificação permitindo ações rápidas
                </p>
              </div>
            </div>

            {/* Uploads de Imagem */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification-logo">Logo/Ícone Personalizado</Label>
                <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-purple-400 transition-colors h-32">
                  {uploadingIcon ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 text-purple-600 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-purple-600 font-medium">Enviando logo...</p>
                      </div>
                    </div>
                  ) : customIcon ? (
                    <div className="relative h-full">
                      <img 
                        src={customIcon} 
                        alt="Logo personalizado"
                        className="w-full h-full object-contain rounded"
                      />
                      <Button
                        type="button"
                        onClick={handleRemoveIcon}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer h-full flex items-center justify-center"
                      onClick={() => handleLabelClick('logo')}
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-zinc-700">Logo (opcional)</p>
                        <p className="text-xs text-zinc-500">Clique para adicionar</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="notification-logo"
                    type="file"
                    accept="image/*"
                    onChange={handleIconSelect}
                    className="hidden"
                    disabled={uploadingIcon}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-image">Imagem Grande (Banner)</Label>
                <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-purple-400 transition-colors h-32">
                  {uploadingImage ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 text-purple-600 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-purple-600 font-medium">Enviando imagem...</p>
                      </div>
                    </div>
                  ) : customImage ? (
                    <div className="relative h-full">
                      <img 
                        src={customImage} 
                        alt="Imagem personalizada"
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer h-full flex items-center justify-center"
                      onClick={() => handleLabelClick('image')}
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-zinc-700">Banner (opcional)</p>
                        <p className="text-xs text-zinc-500">Clique para adicionar</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="notification-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Agendar Envio (Opcional)</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-zinc-500">
                {scheduledDate ? 'Será enviada automaticamente na data especificada' : 'Deixe vazio para envio imediato'}
              </p>
            </div>

            {/* Preview v7.3 Simplificado */}
            {(title || body || customIcon || customImage || customUrl || customButtons.length > 0) && (
              <div className="p-4 bg-gradient-to-r from-zinc-50 to-blue-50 rounded-xl border border-zinc-200">
                <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview da Notificação
                </h4>
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {customIcon ? (
                        <img src={customIcon} alt="Logo" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="p-1.5 bg-blue-100 rounded">
                          <BellIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-zinc-900 text-sm truncate">
                        {title || 'Título da notificação'}
                      </h5>
                      <p className="text-sm text-zinc-600 mt-1">
                        {body || 'Mensagem da notificação'}
                      </p>
                      {customImage && (
                        <div className="mt-2">
                          <img 
                            src={customImage} 
                            alt="Preview da imagem" 
                            className="w-full max-w-xs h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                      {customUrl && (
                        <div className="mt-2 flex items-center text-xs text-blue-600">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <span className="truncate">{customUrl}</span>
                        </div>
                      )}
                      {customButtons.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {customButtons.map((button, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center">
                              <MousePointer className="h-3 w-3 mr-1" />
                              {button.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button 
                onClick={handleSendNotification}
                disabled={loading || !title.trim() || !body.trim() || uploadingIcon || uploadingImage}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {scheduledDate ? 'Agendando...' : 'Enviando...'}
                  </>
                ) : (
                  <>
                    {scheduledDate ? (
                      <>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Agendar
                      </>
                    ) : (
                      <>
                        <SendIcon className="h-4 w-4 mr-2" />
                        Enviar Agora
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateNotification;