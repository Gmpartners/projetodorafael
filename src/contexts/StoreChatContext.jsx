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

const StoreChatContext = createContext();

export const useStoreChat = () => {
  const context = useContext(StoreChatContext);
  if (!context) {
    throw new Error('useStoreChat deve ser usado dentro de StoreChatProvider');
  }
  return context;
};

export const StoreChatProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    online: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const storeId = userProfile?.uid;
  const isStore = userProfile?.role === 'store';

  console.log('🏪 StoreChatContext: storeId =', storeId, 'isStore =', isStore);

  useEffect(() => {
    if (!storeId || !isStore) {
      console.log('⚠️ Loja: Sem storeId ou não é store, pulando listener');
      return;
    }

    console.log('🔥 Loja: Iniciando listener de chats para:', storeId);
    setIsLoading(true);
    setError(null);

    const chatsQuery = query(
      collection(db, 'chats'),
      where('storeId', '==', storeId),
      where('status', '==', 'active'),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        console.log('🏪 Loja: Snapshot recebido, docs:', snapshot.docs.length);
        
        const chatsList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            name: data.participants?.customerName || data.customerName || 'Cliente',
            avatar: `https://i.pravatar.cc/150?u=${data.customerId}`,
            initials: (data.participants?.customerName || data.customerName || 'C')[0],
            isCustomer: true,
            isVerified: true,
            online: true,
            userUnreadCount: data.unreadCount?.store || 0,
            unreadCount: data.unreadCount?.store || 0,
            lastMessage: data.lastMessage || { text: 'Conversa iniciada', timestamp: data.createdAt },
            hasAttention: (data.unreadCount?.store || 0) > 0,
            priority: (data.unreadCount?.store || 0) > 2 ? 'high' : 'medium',
            hasAttachment: false,
            hasRating: false,
            isUrgent: (data.unreadCount?.store || 0) > 3,
            orderStatus: data.orderDetails?.status || 'processing'
          };
        });

        console.log('✅ Loja: Chats processados:', chatsList);
        setChats(chatsList);
        setIsLoading(false);
        setError(null);

        const newStats = {
          total: chatsList.length,
          unread: chatsList.filter(chat => chat.unreadCount > 0).length,
          urgent: chatsList.filter(chat => chat.isUrgent).length,
          online: chatsList.filter(chat => chat.online).length
        };
        
        console.log('📊 Loja: Estatísticas:', newStats);
        setStats(newStats);
      },
      (error) => {
        console.error('❌ Loja: Erro no listener de chats:', error);
        setError('Erro ao carregar conversas');
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [storeId, isStore]);

  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }

    console.log('💬 Loja: Iniciando listener de mensagens para chat:', activeChat.id);

    const messagesQuery = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        console.log('📨 Loja: Mensagens snapshot, docs:', snapshot.docs.length);
        
        const messagesList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            content: data.text || data.content,
            sender: data.senderType || (data.senderId === storeId ? 'store' : 'customer'),
            time: data.timestamp?.toDate?.() || new Date(),
            read: data.read || false
          };
        });

        console.log('✅ Loja: Mensagens processadas:', messagesList.length);
        setMessages(messagesList);
      },
      (error) => {
        console.error('❌ Loja: Erro no listener de mensagens:', error);
        setError('Erro ao carregar mensagens');
      }
    );

    return unsubscribe;
  }, [activeChat?.id, storeId]);

  const sendMessage = async (messageText) => {
    if (!activeChat?.id || !messageText.trim()) return;

    try {
      console.log('📤 Loja: Enviando mensagem:', messageText);

      const messageData = {
        text: messageText.trim(),
        senderId: storeId,
        senderType: 'store',
        senderName: userProfile?.name || 'Loja',
        type: 'text'
      };

      await apiService.sendMessage(activeChat.id, messageData);
      console.log('✅ Loja: Mensagem enviada com sucesso');
      
    } catch (error) {
      console.error('❌ Loja: Erro ao enviar mensagem:', error);
      setError('Erro ao enviar mensagem');
      throw error;
    }
  };

  const markChatAsRead = async (chatId = null) => {
    const targetChatId = chatId || activeChat?.id;
    if (!targetChatId) return;

    try {
      console.log('✅ Loja: Marcando chat como lido:', targetChatId);
      await apiService.markChatAsRead(targetChatId, storeId, 'store');
      console.log('✅ Loja: Chat marcado como lido');
    } catch (error) {
      console.error('❌ Loja: Erro ao marcar como lido:', error);
    }
  };

  const loadActiveChats = async () => {
    console.log('🔄 Loja: loadActiveChats chamado (usando listener em tempo real)');
  };

  const startNewChat = async (orderId, customerId, customerName = 'Cliente') => {
    try {
      console.log('🆕 Loja: Iniciando nova conversa:', { orderId, customerId });
      setIsLoading(true);

      const chatData = await apiService.getOrderChat(orderId, customerId, storeId);
      
      const processedChat = {
        ...chatData,
        name: customerName,
        avatar: `https://i.pravatar.cc/150?u=${customerId}`,
        initials: customerName[0],
        isCustomer: true,
        isVerified: true,
        online: true,
        userUnreadCount: 0
      };

      setActiveChat(processedChat);
      return processedChat;
      
    } catch (error) {
      console.error('❌ Loja: Erro ao iniciar nova conversa:', error);
      setError('Erro ao iniciar conversa');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getChatStats = async () => {
    return stats;
  };

  const value = {
    chats,
    activeChat,
    messages,
    stats,
    isLoading,
    error,
    
    sendMessage,
    markChatAsRead,
    loadActiveChats,
    startNewChat,
    getChatStats,
    setActiveChat,
    
    storeId,
    isStore
  };

  return (
    <StoreChatContext.Provider value={value}>
      {children}
    </StoreChatContext.Provider>
  );
};