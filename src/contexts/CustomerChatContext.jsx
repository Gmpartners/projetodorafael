import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CustomerChatContext = createContext();

export const useCustomerChat = () => {
  const context = useContext(CustomerChatContext);
  if (!context) {
    throw new Error('useCustomerChat deve ser usado dentro de CustomerChatProvider');
  }
  return context;
};

export const CustomerChatProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const customerId = userProfile?.customerId || userProfile?.uid;
  const isCustomer = userProfile?.role === 'customer';

  console.log('👤 CustomerChatContext: customerId =', customerId, 'isCustomer =', isCustomer);

  useEffect(() => {
    if (!customerId || !isCustomer) {
      console.log('⚠️ Cliente: Sem customerId ou não é customer, pulando listener');
      return;
    }

    console.log('🔥 Cliente: Iniciando listener de chats para:', customerId);
    setIsLoading(true);
    setError(null);

    const chatsQuery = query(
      collection(db, 'chats'),
      where('customerId', '==', customerId),
      where('status', '==', 'active'),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(
      chatsQuery, 
      (snapshot) => {
        console.log('📱 Cliente: Snapshot recebido, docs:', snapshot.docs.length);
        
        const chatsList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            name: data.participants?.storeName || data.storeName || 'Loja',
            avatar: `https://i.pravatar.cc/150?u=${data.storeId}`,
            initials: (data.participants?.storeName || data.storeName || 'L')[0],
            isVerified: true,
            online: true,
            userUnreadCount: data.unreadCount?.customer || 0,
            lastMessage: data.lastMessage || { text: 'Conversa iniciada', timestamp: data.createdAt }
          };
        });

        console.log('✅ Cliente: Chats processados:', chatsList);
        setChats(chatsList);
        setIsLoading(false);
        setError(null);

        const totalUnread = chatsList.reduce((sum, chat) => {
          return sum + (chat.userUnreadCount || 0);
        }, 0);
        setUnreadCount(totalUnread);
        console.log('📊 Cliente: Total não lidas:', totalUnread);
      },
      (error) => {
        console.error('❌ Cliente: Erro no listener de chats:', error);
        setError('Erro ao carregar conversas');
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [customerId, isCustomer]);

  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }

    console.log('💬 Cliente: Iniciando listener de mensagens para chat:', activeChat.id);

    const messagesQuery = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        console.log('📨 Cliente: Mensagens snapshot, docs:', snapshot.docs.length);
        
        const messagesList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            content: data.text || data.content,
            sender: data.senderType || (data.senderId === customerId ? 'user' : 'store'),
            time: data.timestamp?.toDate?.() || new Date(),
            read: data.read || false
          };
        });

        console.log('✅ Cliente: Mensagens processadas:', messagesList.length);
        setMessages(messagesList);
      },
      (error) => {
        console.error('❌ Cliente: Erro no listener de mensagens:', error);
        setError('Erro ao carregar mensagens');
      }
    );

    return unsubscribe;
  }, [activeChat?.id, customerId]);

  const getOrCreateChatWithStore = async (orderId, storeId) => {
    try {
      console.log('🏪 Cliente: Buscando/criando chat para pedido:', orderId, 'storeId:', storeId);
      setIsLoading(true);
      setError(null);

      const chatData = await apiService.getOrderChat(orderId, customerId, storeId);
      
      console.log('✅ Cliente: Chat obtido/criado:', chatData);
      
      const processedChat = {
        ...chatData,
        name: chatData.participants?.storeName || chatData.storeName || 'Loja',
        avatar: `https://i.pravatar.cc/150?u=${chatData.storeId}`,
        initials: (chatData.participants?.storeName || chatData.storeName || 'L')[0],
        isVerified: true,
        online: true,
        userUnreadCount: chatData.unreadCount?.customer || 0
      };

      setActiveChat(processedChat);
      return processedChat;
      
    } catch (error) {
      console.error('❌ Cliente: Erro ao obter/criar chat:', error);
      setError('Erro ao acessar conversa');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText) => {
    if (!activeChat?.id || !messageText.trim()) return;

    try {
      console.log('📤 Cliente: Enviando mensagem:', messageText);

      const messageData = {
        text: messageText.trim(),
        senderId: customerId,
        senderType: 'customer',
        senderName: userProfile?.name || 'Cliente',
        type: 'text'
      };

      await apiService.sendMessage(activeChat.id, messageData);
      console.log('✅ Cliente: Mensagem enviada com sucesso');
      
    } catch (error) {
      console.error('❌ Cliente: Erro ao enviar mensagem:', error);
      setError('Erro ao enviar mensagem');
      throw error;
    }
  };

  const markChatAsRead = async (chatId = null) => {
    const targetChatId = chatId || activeChat?.id;
    if (!targetChatId) return;

    try {
      console.log('✅ Cliente: Marcando chat como lido:', targetChatId);
      await apiService.markChatAsRead(targetChatId, customerId, 'customer');
      console.log('✅ Cliente: Chat marcado como lido');
    } catch (error) {
      console.error('❌ Cliente: Erro ao marcar como lido:', error);
    }
  };

  const loadActiveChats = async () => {
    console.log('🔄 Cliente: loadActiveChats chamado (usando listener em tempo real)');
  };

  const value = {
    chats,
    activeChat,
    messages,
    unreadCount,
    isLoading,
    error,
    
    getOrCreateChatWithStore,
    sendMessage,
    markChatAsRead,
    loadActiveChats,
    setActiveChat,
    
    customerId,
    isCustomer
  };

  return (
    <CustomerChatContext.Provider value={value}>
      {children}
    </CustomerChatContext.Provider>
  );
};