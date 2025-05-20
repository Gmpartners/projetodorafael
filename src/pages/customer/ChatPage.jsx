import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Phone,
  Video,
  Image,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  User,
  Box,
  XCircle,
  Star
} from 'lucide-react';

// Mock store data
const stores = [
  {
    id: 1,
    name: "Essência Natural",
    logo: "🌿",
    accent: "#4CAF50",
    verified: true,
    status: "online",
    lastSeen: "Active now",
    unreadCount: 3,
    lastMessage: "Your order is in preparation and will ship soon!"
  },
  {
    id: 2,
    name: "VitaMax Suplementos",
    logo: "💪",
    accent: "#3F51B5",
    verified: true,
    status: "online",
    lastSeen: "Active now",
    unreadCount: 0,
    lastMessage: "The tracking code for your order is XYZ123456."
  },
  {
    id: 3,
    name: "Nature Health",
    logo: "🍃",
    accent: "#00BCD4",
    verified: false,
    status: "offline",
    lastSeen: "Last seen 2h ago",
    unreadCount: 0,
    lastMessage: "Thank you for your purchase!"
  }
];

// Mock messages
const mockMessages = {
  1: [
    {
      id: 1,
      sender: "store",
      content: "Hi John! Welcome to Essência Natural. How can I help you today?",
      time: "10:30 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 2,
      sender: "user",
      content: "Hello! I'm interested in your Nature Burn product. Does it have any side effects?",
      time: "10:35 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 3,
      sender: "store",
      content: "Our Nature Burn is made with 100% natural ingredients and has no known side effects. It's designed to support your metabolism naturally. Would you like more specific information about the ingredients?",
      time: "10:40 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 4,
      sender: "user",
      content: "That sounds great. Yes, please share more details about the ingredients.",
      time: "10:45 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 5,
      sender: "store",
      content: "Nature Burn contains green tea extract, garcinia cambogia, and cayenne pepper - all known to support metabolism. It's caffeine-free and suitable for vegans. Each bottle contains 60 capsules, a one-month supply.",
      time: "10:50 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 6,
      sender: "store",
      content: "Here's our latest promotion: Buy 2 bottles and get 1 free! Would you like to place an order?",
      time: "10:51 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 7,
      sender: "user",
      content: "That sounds like a good deal. I'll take the promotion!",
      time: "11:05 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 8,
      sender: "store",
      content: "Excellent choice! I've created your order. You'll receive 3 bottles of Nature Burn for the price of 2. The total is $89.90. Would you like to proceed to checkout?",
      time: "11:10 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 9,
      sender: "user",
      content: "Yes, I'll complete the checkout now.",
      time: "11:15 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 10,
      sender: "store",
      content: "Perfect! Here's the checkout link. After your payment is confirmed, we'll process your order immediately.",
      time: "11:20 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 11,
      sender: "system",
      content: "Order #EN-7845 has been created",
      time: "11:30 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 12,
      sender: "store",
      content: "Great news! Your order #EN-7845 has been confirmed. We're now preparing your Nature Burn package with care. It should ship within 24 hours!",
      time: "11:35 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 13,
      sender: "user",
      content: "Awesome! Thank you for the quick service.",
      time: "11:40 AM",
      date: "Yesterday",
      read: true
    },
    {
      id: 14,
      sender: "store",
      content: "You're welcome! We're processing your order now. It will be shipped tomorrow and should arrive by May 21. You'll receive tracking information as soon as it's available.",
      time: "08:30 AM",
      date: "Today",
      read: false
    },
    {
      id: 15,
      sender: "store",
      content: "Is there anything else you need help with regarding your order?",
      time: "08:31 AM",
      date: "Today",
      read: false
    },
    {
      id: 16,
      sender: "store",
      content: "By the way, here's a guide on how to get the best results with Nature Burn. Recommended dosage is 2 capsules daily with water before meals.",
      time: "08:35 AM",
      date: "Today",
      read: false
    }
  ],
  2: [
    {
      id: 1,
      sender: "store",
      content: "Hi John! Thanks for choosing VitaMax Suplementos. Your order of Whey Protein Premium has been shipped!",
      time: "2:30 PM",
      date: "May 17",
      read: true
    },
    {
      id: 2,
      sender: "store",
      content: "The tracking code for your order is XYZ123456. You can track it here: [tracking link]",
      time: "2:35 PM",
      date: "May 17",
      read: true
    },
    {
      id: 3,
      sender: "user",
      content: "Thank you! When should I expect the delivery?",
      time: "3:00 PM",
      date: "May 17",
      read: true
    },
    {
      id: 4,
      sender: "store",
      content: "Your order is on the way and should arrive by May 19. The courier will contact you before delivery.",
      time: "3:05 PM",
      date: "May 17",
      read: true
    }
  ],
  3: [
    {
      id: 1,
      sender: "user",
      content: "Hello, do you have organic vitamins available?",
      time: "11:30 AM",
      date: "May 15",
      read: true
    },
    {
      id: 2,
      sender: "store",
      content: "Hi John! Yes, we have a complete line of organic vitamins. Are you looking for any specific one?",
      time: "11:45 AM",
      date: "May 15",
      read: true
    },
    {
      id: 3,
      sender: "user",
      content: "I'm looking for Vitamin D and B-complex, preferably organic.",
      time: "12:00 PM",
      date: "May 15",
      read: true
    },
    {
      id: 4,
      sender: "store",
      content: "We have both in stock! Our organic Vitamin D3 comes from lichen and the B-complex is derived from organic fruits and herbs. Would you like me to send you more information about them?",
      time: "12:10 PM",
      date: "May 15",
      read: true
    },
    {
      id: 5,
      sender: "user",
      content: "Yes, please send me the details and prices.",
      time: "12:15 PM",
      date: "May 15",
      read: true
    },
    {
      id: 6,
      sender: "store",
      content: "Here are the details for our organic vitamins: Vitamin D3 (2000 IU) - $24.90 for 60 capsules, B-Complex - $29.90 for 90 capsules. Both are certified organic and vegan-friendly.",
      time: "12:20 PM",
      date: "May 15",
      read: true
    },
    {
      id: 7,
      sender: "store",
      content: "We're currently offering 10% off on your first order. Would you like to place an order?",
      time: "12:21 PM",
      date: "May 15",
      read: true
    },
    {
      id: 8,
      sender: "user",
      content: "Thank you for your help. I'll think about it and get back to you soon.",
      time: "12:30 PM",
      date: "May 15",
      read: true
    },
    {
      id: 9,
      sender: "store",
      content: "You're welcome! Feel free to reach out if you have any other questions. Our offer will be valid for the next 7 days.",
      time: "12:35 PM",
      date: "May 15",
      read: true
    }
  ]
};

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStore, setActiveStore] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messageEndRef = useRef(null);
  
  // Set up active store based on the route parameter or default to first store
  useEffect(() => {
    if (id) {
      const store = stores.find(s => s.id === parseInt(id));
      if (store) {
        setActiveStore(store);
        setMessages(mockMessages[store.id] || []);
        setShowMobileChat(true);
      } else {
        // Invalid ID, redirect to first store
        navigate('/customer/chat/' + stores[0].id);
      }
    } else if (stores.length > 0) {
      setActiveStore(stores[0]);
      setMessages(mockMessages[stores[0].id] || []);
    }
  }, [id, navigate]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Filter stores by search query
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!message.trim() || !activeStore) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: message.trim(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: 'Today',
      read: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Simulate store response
    setTimeout(() => {
      const storeResponse = {
        id: messages.length + 2,
        sender: 'store',
        content: `Thank you for your message. Our team will get back to you shortly. Is there anything else we can help with regarding your order?`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: 'Today',
        read: false
      };
      
      setMessages(prevMessages => [...prevMessages, storeResponse]);
    }, 1000);
  };

  const selectStore = (store) => {
    navigate('/customer/chat/' + store.id);
    setActiveStore(store);
    setMessages(mockMessages[store.id] || []);
    setShowMobileChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col relative">
      {/* Pattern background */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 py-4 text-white relative z-10 shadow-lg">
        {/* Header background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg"
              onClick={() => navigate('/customer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      {/* Main chat interface */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar - Store list */}
        <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-80 md:min-w-80 bg-white border-r border-gray-200 md:h-[calc(100vh-64px)] shadow-md relative z-10`}>
          <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
            <div className="relative">
              {!showSearch ? (
                <div className="flex items-center">
                  <Input
                    placeholder="Search messages..."
                    className="pl-9 pr-4 py-2 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200 shadow-sm rounded-lg"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              ) : (
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Search messages..."
                    className="pl-3 pr-4 py-2 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200 shadow-sm rounded-lg"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {filteredStores.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-inner">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-800">No stores found</h3>
                <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
              </div>
            ) : (
              filteredStores.map(store => (
                <button
                  key={store.id}
                  className={`w-full p-3 border-b border-gray-100 flex items-start hover:bg-gradient-to-r hover:from-purple-50/70 hover:to-indigo-50/70 transition-colors ${
                    activeStore?.id === store.id ? 'bg-gradient-to-r from-purple-50 to-indigo-50' : ''
                  } shadow-sm`}
                  onClick={() => selectStore(store)}
                >
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl mr-3 relative shadow-md"
                    style={{ background: `linear-gradient(135deg, ${store.accent}15, ${store.accent}25)` }}
                  >
                    {store.logo}
                    {store.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {store.name}
                        {store.verified && (
                          <CheckCircle className="h-3.5 w-3.5 text-blue-500 ml-1" />
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {store.lastSeen.includes('Active') ? (
                          <span className="text-green-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          store.lastSeen
                        )}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate">
                      {store.lastMessage}
                    </p>
                    
                    {store.unreadCount > 0 && (
                      <div className="flex justify-between items-center mt-1">
                        <span></span>
                        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm">{store.unreadCount}</Badge>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className={`${!showMobileChat ? 'hidden' : 'flex'} md:flex flex-col flex-1 bg-gradient-to-br from-gray-50 to-white h-[calc(100vh-64px)] relative z-10`}>
          {activeStore ? (
            <>
              {/* Chat header */}
              <div className="flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMobileChat(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${activeStore.accent}15, ${activeStore.accent}25)` }}
                >
                  {activeStore.logo}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <h2 className="font-medium text-gray-900">{activeStore.name}</h2>
                    {activeStore.verified && (
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs shadow-sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center">
                    {activeStore.status === 'online' ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Online
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        {activeStore.lastSeen}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-4">
                  {/* Store info card at the beginning */}
                  <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
                    <CardContent className="p-4 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                      <div className="flex items-center">
                        <div 
                          className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl mr-4 shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${activeStore.accent}15, ${activeStore.accent}30)` }}
                        >
                          {activeStore.logo}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            {activeStore.name}
                            {activeStore.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                            )}
                          </h3>
                          
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">4.9</span>
                          </div>
                          
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-purple-600 border-purple-200 hover:bg-purple-50 shadow-sm hover:shadow"
                              onClick={() => navigate(`/customer/orders/${activeStore.id}`)}
                            >
                              View Orders
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Date separator */}
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-500 bg-white px-2 rounded-full shadow-sm">
                      Conversation with {activeStore.name}
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  
                  {/* Messages */}
                  {messages.map((msg, idx) => {
                    // Check if we need a date separator
                    const showDate = idx === 0 || messages[idx - 1].date !== msg.date;
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-xs text-gray-500 bg-white px-2 rounded-full shadow-sm">{msg.date}</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                          </div>
                        )}
                        
                        {msg.sender === 'system' ? (
                          <div className="text-center my-3 animate-fadeIn">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs shadow-sm">
                              {msg.content}
                            </span>
                          </div>
                        ) : (
                          <div 
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}
                          >
                            <div className={`max-w-[75%]`}>
                              <div className={`rounded-2xl p-3 ${
                                msg.sender === 'user' 
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md' 
                                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                              
                              <div className={`flex items-center mt-1 text-xs text-gray-400 ${
                                msg.sender === 'user' ? 'justify-end' : 'justify-start'
                              }`}>
                                <span>{msg.time}</span>
                                {msg.sender === 'user' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                                    <path d="M20 6L9 17l-5-5"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-3 bg-white border-t border-gray-200 shadow-inner">
                <div className="max-w-3xl mx-auto flex items-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      className="pr-10 py-2 min-h-12 resize-none text-sm border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-lg shadow-inner"
                      placeholder="Type your message..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 bottom-1/2 transform translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <Button 
                    size="icon" 
                    className={message.trim() 
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md" 
                      : "bg-gray-300 cursor-not-allowed"}
                    disabled={!message.trim()}
                    onClick={handleSendMessage}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 mb-4 shadow-inner">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h2>
              <p className="text-gray-500 text-center max-w-md mb-4">
                Select a conversation to view messages
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
                onClick={() => setShowMobileChat(false)}
              >
                View Conversations
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 md:hidden z-20 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button 
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Box className="h-6 w-6" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-purple-600"
            onClick={() => navigate('/customer/chat')}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors"
            onClick={() => navigate('/customer/profile')}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes message-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
        
        .animate-message-in {
          animation: message-in 0.3s ease forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;