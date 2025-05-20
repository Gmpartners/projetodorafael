import React, { useState, useEffect } from 'react';
import { 
  updateNotification, 
  notificationTypes, 
  customerSegments,
  fetchCustomers
} from '@/services/push-notifications/pushNotificationService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Removendo a importação problemática do Calendar
// import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { 
  SendIcon, 
  SaveIcon, 
  XIcon, 
  CalendarIcon,
  SearchIcon,
  CheckIcon,
  UsersIcon,
  UserIcon,
  BellIcon
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const NotificationEditor = ({ 
  notification, 
  onSave, 
  onCancel, 
  isLoading = false,
  isEditing = false 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    body: notification?.body || '',
    type: notification?.type || 'custom',
    status: notification?.status || 'draft',
    scheduledFor: notification?.scheduledFor ? new Date(notification.scheduledFor) : null,
    targetCustomerId: notification?.targetCustomer?.id || '',
    targetSegment: notification?.targetSegment || 'all_customers',
    metadata: notification?.metadata || {}
  });

  const [targetType, setTargetType] = useState(
    notification?.targetCustomer ? 'customer' : 
    notification?.targetSegment ? 'segment' : 'all'
  );
  const [sendType, setSendType] = useState(
    notification?.scheduledFor ? 'scheduled' : 'immediate'
  );
  const [customers, setCustomers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Carregar clientes quando necessário
  useEffect(() => {
    const loadCustomers = async () => {
      if (targetType === 'customer') {
        setIsSearching(true);
        try {
          const data = await fetchCustomers(searchQuery);
          setCustomers(data);
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
        } finally {
          setIsSearching(false);
        }
      }
    };
    
    loadCustomers();
  }, [targetType, searchQuery]);
  
  // Função para lidar com a busca de clientes
  const handleCustomerSearch = (value) => {
    setSearchQuery(value);
  };
  
  // Função para lidar com a mudança de tipo de destino
  const handleTargetTypeChange = (value) => {
    setTargetType(value);
    
    // Limpar valores relacionados a outros tipos
    if (value === 'customer') {
      setFormData(prev => ({...prev, targetSegment: ''}));
    } else if (value === 'segment') {
      setFormData(prev => ({...prev, targetCustomerId: ''}));
    } else {
      setFormData(prev => ({
        ...prev, 
        targetCustomerId: '',
        targetSegment: ''
      }));
    }
  };
  
  // Função para lidar com a mudança de tipo de envio
  const handleSendTypeChange = (value) => {
    setSendType(value);
    
    if (value === 'immediate') {
      setFormData(prev => ({...prev, scheduledFor: null}));
    }
  };
  
  // Validar o formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'O conteúdo é obrigatório';
    }
    
    if (targetType === 'customer' && !formData.targetCustomerId) {
      newErrors.targetCustomerId = 'Selecione um cliente';
    }
    
    if (targetType === 'segment' && !formData.targetSegment) {
      newErrors.targetSegment = 'Selecione um segmento';
    }
    
    if (sendType === 'scheduled' && !formData.scheduledFor) {
      newErrors.scheduledFor = 'Selecione uma data';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = (status = formData.status) => {
    if (!validateForm()) return;
    
    // Construir objeto de notificação
    const notificationData = {
      title: formData.title,
      body: formData.body,
      type: formData.type,
      status: status
    };
    
    // Adicionar dados de agendamento se necessário
    if (sendType === 'scheduled' && formData.scheduledFor) {
      notificationData.scheduledFor = formData.scheduledFor.toISOString();
    }
    
    // Adicionar dados de destino
    if (targetType === 'customer' && formData.targetCustomerId) {
      const selectedCustomer = customers.find(c => c.id === formData.targetCustomerId);
      if (selectedCustomer) {
        notificationData.targetCustomer = selectedCustomer;
      }
    } else if (targetType === 'segment' && formData.targetSegment) {
      notificationData.targetSegment = formData.targetSegment;
    } else {
      notificationData.targetSegment = 'all_customers';
    }
    
    // Adicionar metadata se houver
    if (formData.metadata) {
      notificationData.metadata = formData.metadata;
    }
    
    if (isEditing && notification?.id) {
      // Se estiver editando, atualizar notificação existente
      updateNotification(notification.id, notificationData)
        .then(() => onSave())
        .catch(error => console.error('Erro ao atualizar notificação:', error));
    } else {
      // Se estiver criando, salvar nova notificação
      onSave(notificationData);
    }
  };
  
  const handleSaveAsDraft = () => {
    handleSubmit('draft');
  };
  
  const handleSendNow = () => {
    handleSubmit('sent');
  };
  
  const handleSchedule = () => {
    handleSubmit('scheduled');
  };
  
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  // Componente de visualização
  const NotificationPreview = () => {
    const title = formData.title || 'Título da notificação';
    const body = formData.body || 'Corpo da notificação. Adicione o conteúdo que deseja enviar aos seus clientes.';
    
    return (
      <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Visualização da notificação</h4>
        
        <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm max-w-sm mx-auto">
          <div className="flex items-start mb-3">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
              <BellIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Agora</p>
              <h3 className="font-medium text-zinc-900 mb-1">{title}</h3>
              <p className="text-sm text-zinc-700">{body}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-zinc-900">Título da Notificação</Label>
            <Input 
              placeholder="Digite o título da notificação" 
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={errors.title ? 'border-red-300' : ''}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Título curto e chamativo que aparecerá na notificação.
            </p>
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <Label className="text-zinc-900">Conteúdo da Notificação</Label>
            <Textarea 
              placeholder="Digite o conteúdo da notificação"
              className={cn("min-h-[120px]", errors.body ? 'border-red-300' : '')}
              value={formData.body}
              onChange={(e) => handleChange('body', e.target.value)}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Mensagem principal da notificação. Seja claro e direto.
            </p>
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body}</p>}
          </div>
          
          <div>
            <Label className="text-zinc-900">Tipo de Notificação</Label>
            <Select 
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de notificação" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500 mt-1">
              O tipo ajuda a categorizar e personalizar a aparência da notificação.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-900 mb-2">Destinatários</h3>
            <RadioGroup 
              value={targetType}
              onValueChange={handleTargetTypeChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="all" id="r1" />
                <Label htmlFor="r1" className="font-normal cursor-pointer flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2 text-zinc-600" />
                  Todos os clientes
                </Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="segment" id="r2" />
                <Label htmlFor="r2" className="font-normal cursor-pointer flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2 text-indigo-600" />
                  Segmento específico
                </Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="customer" id="r3" />
                <Label htmlFor="r3" className="font-normal cursor-pointer flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Cliente específico
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {targetType === 'segment' && (
            <div>
              <Label className="text-zinc-900">Segmento de Clientes</Label>
              <Select 
                value={formData.targetSegment || 'all_customers'}
                onValueChange={(value) => handleChange('targetSegment', value)}
              >
                <SelectTrigger className={errors.targetSegment ? 'border-red-300' : ''}>
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  {customerSegments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 mt-1">
                Enviar para um grupo específico de clientes.
              </p>
              {errors.targetSegment && <p className="text-xs text-red-500 mt-1">{errors.targetSegment}</p>}
            </div>
          )}
          
          {targetType === 'customer' && (
            <div>
              <Label className="text-zinc-900">Selecionar Cliente</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-normal",
                      !formData.targetCustomerId && "text-zinc-500",
                      errors.targetCustomerId && "border-red-300"
                    )}
                  >
                    {formData.targetCustomerId ? (
                      customers.find((customer) => customer.id === formData.targetCustomerId)?.name
                    ) : (
                      "Buscar cliente..."
                    )}
                    <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Buscar cliente..." 
                      onValueChange={handleCustomerSearch}
                    />
                    {isSearching ? (
                      <div className="py-6 text-center text-sm text-zinc-500">
                        <div className="animate-spin h-5 w-5 border-2 border-zinc-200 border-t-zinc-500 rounded-full mx-auto mb-2"></div>
                        Buscando clientes...
                      </div>
                    ) : (
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                handleChange('targetCustomerId', customer.id);
                              }}
                            >
                              <div className="flex items-center">
                                <span>{customer.name}</span>
                                <span className="ml-2 text-xs text-zinc-500">
                                  {customer.email}
                                </span>
                              </div>
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  customer.id === formData.targetCustomerId
                                    ? "opacity-100 text-green-600"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-zinc-500 mt-1">
                Enviar notificação diretamente para um cliente específico.
              </p>
              {errors.targetCustomerId && <p className="text-xs text-red-500 mt-1">{errors.targetCustomerId}</p>}
            </div>
          )}
          
          <div className="pt-2">
            <h3 className="text-sm font-medium text-zinc-900 mb-2">Quando Enviar</h3>
            <RadioGroup 
              value={sendType}
              onValueChange={handleSendTypeChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="immediate" id="r4" />
                <Label htmlFor="r4" className="font-normal cursor-pointer">
                  Enviar imediatamente após salvar
                </Label>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="scheduled" id="r5" />
                <Label htmlFor="r5" className="font-normal cursor-pointer">
                  Agendar para enviar depois
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {sendType === 'scheduled' && (
            <div>
              <Label className="text-zinc-900">Data de Envio</Label>
              {/* Substituindo o Calendar por inputs simples */}
              <div className="flex flex-col space-y-2 mt-1">
                <Input
                  type="date"
                  value={formData.scheduledFor ? format(formData.scheduledFor, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-');
                      const newDate = new Date(formData.scheduledFor || new Date());
                      newDate.setFullYear(parseInt(year));
                      newDate.setMonth(parseInt(month) - 1);
                      newDate.setDate(parseInt(day));
                      handleChange('scheduledFor', newDate);
                    }
                  }}
                  className={errors.scheduledFor ? 'border-red-300' : ''}
                />
                <Input
                  type="time"
                  value={formData.scheduledFor ? format(formData.scheduledFor, "HH:mm") : "09:00"}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(formData.scheduledFor || new Date());
                      newDate.setHours(parseInt(hours));
                      newDate.setMinutes(parseInt(minutes));
                      handleChange('scheduledFor', newDate);
                    }
                  }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Escolha a data e hora para enviar esta notificação.
              </p>
              {errors.scheduledFor && <p className="text-xs text-red-500 mt-1">{errors.scheduledFor}</p>}
            </div>
          )}
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mt-4"
            onClick={togglePreview}
          >
            {previewMode ? "Ocultar Visualização" : "Visualizar Notificação"}
          </Button>
        </div>
      </div>
      
      {previewMode && <NotificationPreview />}
      
      <div className="flex justify-between pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          <XIcon className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            Salvar como Rascunho
          </Button>
          
          {sendType === 'scheduled' ? (
            <Button 
              type="button"
              onClick={handleSchedule}
              disabled={isLoading || !formData.scheduledFor}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          ) : (
            <Button 
              type="button"
              onClick={handleSendNow}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <SendIcon className="h-4 w-4 mr-2" />
              Enviar Agora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationEditor;