import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  or
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
    online: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const storeId = userProfile?.uid;
  const storeEmail = userProfile?.email;
  const isStore = userProfile?.role === 'store';

  useEffect(() => {
    if (!storeId || !isStore) {
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('🔍 StoreChatContext: Buscando chats para:', {
      storeId,
      storeEmail,
      userProfile
    });

    // 🔧 CORREÇÃO: Buscar chats por UID OU email da loja
    const chatsQuery = query(
      collection(db, 'chats'),
      where('status', '==', 'active'),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        // 🔧 CORREÇÃO: Filtrar chats que pertencem a esta loja
        const chatsList = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data
            };
          })
          .filter(chat => {
            // Verifica se o chat pertence a esta loja por:
            // 1. storeId == uid
            // 2. storeEmail == email da loja
            // 3. participants.storeId == uid
            // 4. participants.storeEmail == email
            return (
              chat.storeId === storeId ||
              chat.storeEmail === storeEmail ||
              chat.participants?.storeId === storeId ||
              chat.participants?.storeEmail === storeEmail ||
              // 🔧 NOVO: Verificar também pelo email hardcoded temporariamente
              (storeEmail === 'loja-teste-rafael@teste.com' && 
               (chat.storeId === 'loja-teste-rafael' || 
                chat.storeEmail === 'loja-teste-rafael@teste.com'))
            );
          })
          .map(chat => {
            return {
              ...chat,
              name: chat.participants?.customerName || chat.customerName || 'Cliente',
              avatar: `https://i.pravatar.cc/150?u=${chat.customerId}`,
              initials: (chat.participants?.customerName || chat.customerName || 'C')[0],
              isCustomer: true,
              isVerified: true,
              online: true,
              userUnreadCount: chat.unreadCount?.store || 0,
              unreadCount: chat.unreadCount?.store || 0,
              lastMessage: chat.lastMessage || { text: 'Conversa iniciada', timestamp: chat.createdAt },
              hasAttention: (chat.unreadCount?.store || 0) > 0,
              priority: (chat.unreadCount?.store || 0) > 2 ? 'high' : 'medium',
              hasAttachment: false,
              hasRating: false,
              orderStatus: chat.orderDetails?.status || 'processing'
            };
          });

        console.log('📊 Chats encontrados:', {
          total: snapshot.docs.length,
          filtered: chatsList.length,
          chats: chatsList
        });

        setChats(chatsList);
        setIsLoading(false);
        setError(null);

        // Estatísticas simplificadas - removendo urgentes
        const newStats = {
          total: chatsList.length,
          unread: chatsList.filter(chat => chat.unreadCount > 0).length,
          online: chatsList.filter(chat => chat.online).length
        };
        
        setStats(newStats);
      },
      (error) => {
        console.error('Erro ao carregar conversas:', error);
        setError('Erro ao carregar conversas');
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [storeId, storeEmail, isStore]);

  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }

    console.log('📨 Carregando mensagens para chat:', activeChat.id);

    const messagesQuery = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
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

        console.log('✅ Mensagens carregadas:', messagesList.length);
        setMessages(messagesList);
      },
      (error) => {
        console.error('Erro ao carregar mensagens:', error);
        setError('Erro ao carregar mensagens');
      }
    );

    return unsubscribe;
  }, [activeChat?.id, storeId]);

  const sendMessage = async (messageText) => {
    if (!activeChat?.id || !messageText.trim()) return;

    try {
      console.log('📤 Enviando mensagem da loja:', {
        chatId: activeChat.id,
        storeId,
        message: messageText
      });

      const messageData = {
        text: messageText.trim(),
        senderId: storeId,
        senderType: 'store',
        senderName: userProfile?.name || 'Loja',
        type: 'text'
      };

      await apiService.sendMessage(activeChat.id, messageData);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError('Erro ao enviar mensagem');
      throw error;
    }
  };

  const markChatAsRead = async (chatId = null) => {
    const targetChatId = chatId || activeChat?.id;
    if (!targetChatId) return;

    try {
      await apiService.markChatAsRead(targetChatId, storeId, 'store');
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const loadActiveChats = async () => {
    // Função mantida para compatibilidade - usa listener em tempo real
  };

  const startNewChat = async (orderId, customerId, customerName = 'Cliente') => {
    try {
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
      console.error('Erro ao iniciar nova conversa:', error);
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