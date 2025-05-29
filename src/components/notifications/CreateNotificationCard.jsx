import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { 
  PlusIcon,
  SendIcon,
  CalendarIcon,
  ImageIcon,
  TrashIcon,
  Loader2,
  BellIcon,
  EyeIcon
} from 'lucide-react';

const CreateNotificationCard = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('custom');
  const [targetType, setTargetType] = useState('subscribers');
  const [targetUserId, setTargetUserId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationImage, setNotificationImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    setNotificationImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    toast.success('Imagem selecionada! 📸');
  };

  const handleRemoveImage = () => {
    setNotificationImage(null);
    setImagePreview(null);
    document.getElementById('notification-image')?.value && (document.getElementById('notification-image').value = '');
    toast.success('Imagem removida');
  };

  const uploadNotificationImage = async () => {
    if (!notificationImage) return null;

    try {
      setUploadingImage(true);
      const result = await apiService.uploadBanner(notificationImage);
      return result.data?.imageUrl || result.imageUrl;
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Preencha título e mensagem');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (notificationImage) {
        imageUrl = await uploadNotificationImage();
        if (!imageUrl) {
          toast.error('Erro ao fazer upload da imagem');
          return;
        }
      }

      const baseNotificationData = {
        title: title.trim(),
        body: body.trim(),
        type,
        data: {
          type,
          timestamp: new Date().toISOString(),
          source: 'manual_creation',
          ...(imageUrl && { imageUrl })
        }
      };

      if (imageUrl) {
        baseNotificationData.image = imageUrl;
      }

      if (scheduledDate) {
        const notificationData = {
          ...baseNotificationData,
          scheduledDate: new Date(scheduledDate).toISOString()
        };

        await apiService.createNotification(notificationData);
        
        toast.success('📅 Notificação agendada com sucesso!', {
          description: `Será enviada em ${new Date(scheduledDate).toLocaleString()}`
        });
      } else {
        const notificationData = {
          ...baseNotificationData,
          target: targetType,
          targetId: targetUserId || undefined
        };

        await apiService.sendImmediateNotification(notificationData);
        
        toast.success('🚀 Notificação enviada com sucesso!', {
          description: `Enviada para ${targetType === 'subscribers' ? 'todos os inscritos' : 'usuário específico'}`
        });
      }
      
      setTitle('');
      setBody('');
      setTargetUserId('');
      setScheduledDate('');
      handleRemoveImage();
      
    } catch (error) {
      toast.error('❌ Erro ao enviar notificação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 border-0 shadow-premium">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg">
          <PlusIcon className="h-6 w-6 text-purple-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Criar Notificação Personalizada</h3>
          <p className="text-zinc-600">Envie uma notificação com imagem personalizada</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notification-image">Imagem da Notificação (Opcional)</Label>
          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview da imagem"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
                <Badge className="absolute bottom-2 left-2 bg-white/90 text-zinc-800">
                  {notificationImage?.name} ({Math.round(notificationImage?.size / 1024)}KB)
                </Badge>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-600 mb-2">
                  Clique para selecionar uma imagem
                </p>
                <p className="text-xs text-zinc-500">
                  PNG, JPG ou WebP até 5MB
                </p>
              </div>
            )}
            <input
              id="notification-image"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-xs text-zinc-500">
            A imagem aparecerá na notificação push como imagem grande expandível
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Notificação</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="promotion">🎁 Promoção</SelectItem>
              <SelectItem value="news">📢 Novidade</SelectItem>
              <SelectItem value="order_update">📦 Atualização de Pedido</SelectItem>
              <SelectItem value="feedback">⭐ Solicitação de Avaliação</SelectItem>
              <SelectItem value="custom">💬 Personalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="title">Título da Notificação</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nova promoção disponível!"
            maxLength={50}
          />
          <p className="text-xs text-zinc-500">{title.length}/50 caracteres</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Mensagem</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Digite a mensagem da notificação..."
            rows={4}
            maxLength={160}
          />
          <p className="text-xs text-zinc-500">{body.length}/160 caracteres</p>
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

        {(title || body || imagePreview) && (
          <div className="p-4 bg-gradient-to-r from-zinc-50 to-blue-50 rounded-xl border border-zinc-200">
            <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center">
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview da Notificação
            </h4>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BellIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-zinc-900 text-sm">
                    {title || 'Título da notificação'}
                  </h5>
                  <p className="text-sm text-zinc-600 mt-1">
                    {body || 'Mensagem da notificação'}
                  </p>
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-w-xs h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                  <div className="flex items-center mt-2 text-xs text-zinc-400">
                    <span>Projeto Rafael</span>
                    <span className="mx-2">•</span>
                    <span>{scheduledDate ? 'Agendada' : 'Agora'}</span>
                    {imagePreview && (
                      <>
                        <span className="mx-2">•</span>
                        <span>📷 Com imagem</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSendNotification}
          disabled={loading || uploadingImage || !title.trim() || !body.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading || uploadingImage ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadingImage ? 'Fazendo upload...' : (scheduledDate ? 'Agendando...' : 'Enviando...')}
            </>
          ) : (
            <>
              {scheduledDate ? (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Agendar Notificação
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Enviar Agora
                </>
              )}
              {imagePreview && <ImageIcon className="h-4 w-4 ml-2" />}
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  );
};

export default CreateNotificationCard;