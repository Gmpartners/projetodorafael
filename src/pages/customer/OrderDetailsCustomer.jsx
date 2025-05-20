import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Truck,
  CheckCircle,
  MessageSquare,
  Clock,
  MapPin,
  CreditCard,
  Star,
  Receipt,
  Send,
  ShieldCheck,
  ArrowLeft,
  Home,
  ExternalLink,
  LogOut,
  MoreHorizontal,
  Box,
  User,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const orderDetails = {
  id: 1,
  orderCode: "#EN-7845",
  storeId: 1,
  date: "May 18",
  status: "In preparation",
  statusCode: 2,
  estimated: "May 21",
  progress: 40,
  items: [
    {
      id: 1,
      name: "Nature Burn Encapsulated",
      quantity: 3,
      price: 89.90,
      total: 269.70,
      image: "🍵"
    }
  ],
  shipping: {
    fee: 15.90,
    address: "1578 Paulista Ave, Apt 502, Sao Paulo",
    zipCode: "01310-200",
    method: "Express Delivery",
  },
  payment: {
    method: "Credit card",
    card: "**** **** **** 4921",
    installments: "3x $95.20",
    status: "Approved"
  },
  total: 285.60,
  store: {
    id: 1,
    name: "Essência Natural",
    logo: "🌿",
    accent: "#4CAF50",
    verified: true,
    rating: 4.9,
    responseTime: "5 min",
    contactEmail: "contact@essencianatural.com",
    contactPhone: "(555) 123-4567"
  },
  timeline: [
    { 
      id: 1, 
      date: "05/18", 
      time: "08:45", 
      status: "Order Confirmed", 
      description: "Your order has been received and is being processed.",
      completed: true
    },
    { 
      id: 2, 
      date: "05/18", 
      time: "14:30", 
      status: "In Preparation", 
      description: "We are preparing your products for shipping.",
      completed: true
    },
    { 
      id: 3, 
      date: "05/21", 
      time: "---", 
      status: "Shipment", 
      description: "Your order will be sent for delivery.",
      completed: false
    },
    { 
      id: 4, 
      date: "05/21", 
      time: "---", 
      status: "Delivery", 
      description: "Estimated time to receive your order.",
      completed: false
    }
  ],
  messages: [
    {
      id: 1,
      sender: "store",
      content: "Hi John! This is Maria from Essência Natural. Your Nature Burn order has been received successfully! We're preparing your encapsulated product with care. Let me know if you have any questions.",
      time: "10:30",
      date: "Today",
      read: true
    },
    {
      id: 2,
      sender: "user",
      content: "Hi Maria! Thanks for the confirmation. When do you think my order will be shipped?",
      time: "10:48",
      date: "Today",
      read: true
    },
    {
      id: 3,
      sender: "store",
      content: "John, your order is in the final preparation stage! Our commitment is to ship it by tomorrow afternoon. You'll be notified immediately when it's dispatched! 😊",
      time: "11:05", 
      date: "Today",
      read: false
    }
  ]
};

const OrderDetailsCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [floatingChat, setFloatingChat] = useState(false);
  const [orderRating, setOrderRating] = useState(0);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setChatMessages(orderDetails.messages || []);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatVisible) {
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  }, [chatVisible, chatMessages]);

  const handleToggleChat = () => {
    setChatVisible(!chatVisible);
    
    if (floatingChat && !chatVisible) {
      setFloatingChat(false);
    }
  };

  const handleFloatingChat = () => {
    setFloatingChat(!floatingChat);
    
    if (!chatVisible) {
      setChatVisible(true);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMsg = {
      id: chatMessages.length + 1,
      sender: "user",
      content: chatMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: "Today",
      read: true
    };
    
    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setChatMessage("");
    
    setTimeout(() => {
      const storeReply = {
        id: updatedMessages.length + 1,
        sender: "store",
        content: `We've received your message, John! Our team is looking into it and will respond shortly. You'll always have our full support and attention to ensure your satisfaction! 💜`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: "Today",
        read: false
      };
      
      setChatMessages([...updatedMessages, storeReply]);
    }, 1500);
  };

  const getStatusColor = (statusCode) => {
    switch(statusCode) {
      case 1: return {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        text: "text-amber-600",
        bg: "bg-amber-500",
        icon: "bg-amber-100 text-amber-600",
        timeline: "border-amber-500 bg-amber-500"
      };
      case 2: return {
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        text: "text-blue-600",
        bg: "bg-blue-500",
        icon: "bg-blue-100 text-blue-600",
        timeline: "border-blue-500 bg-blue-500"
      };
      case 3: return {
        badge: "bg-purple-100 text-purple-800 border-purple-200",
        text: "text-purple-600",
        bg: "bg-purple-600",
        icon: "bg-purple-100 text-purple-600",
        timeline: "border-purple-600 bg-purple-600"
      };
      case 4: return {
        badge: "bg-green-100 text-green-800 border-green-200",
        text: "text-green-600",
        bg: "bg-green-500",
        icon: "bg-green-100 text-green-600",
        timeline: "border-green-500 bg-green-500"
      };
      default: return {
        badge: "bg-gray-100 text-gray-800 border-gray-200",
        text: "text-gray-600",
        bg: "bg-gray-500",
        icon: "bg-gray-100 text-gray-600",
        timeline: "border-gray-500 bg-gray-500"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  const colors = getStatusColor(orderDetails.statusCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative">
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
      </div>

      <header className="relative z-10 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white shadow-xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-6 relative">
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white bg-white/10 hover:bg-white/20 transition-all rounded-lg backdrop-blur-sm"
              onClick={() => navigate('/customer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm"
                onClick={() => setShowMobileNav(!showMobileNav)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl animate-heartbeat shadow-lg">
              {orderDetails.store.logo}
            </div>
            
            <div>
              <div className="flex items-center">
                <h1 className="text-xl font-bold">{orderDetails.store.name}</h1>
                {orderDetails.store.verified && (
                  <Badge variant="outline" className="ml-2 border-green-400/30 bg-green-400/10 text-green-100 backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= Math.floor(orderDetails.store.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`} 
                    />
                  ))}
                </div>
                <span className="ml-1 text-sm">{orderDetails.store.rating}</span>
              </div>
              
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="bg-white/10 border-white/20 font-normal backdrop-blur-sm">
                  Order {orderDetails.orderCode}
                </Badge>
                <span className="text-sm ml-3 text-white/70">{orderDetails.date}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showMobileNav && (
        <div className="fixed top-20 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-100 w-48 py-1 animate-slideIn">
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-2"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-2"
            onClick={() => navigate('/customer/chat')}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-2"
            onClick={() => navigate('/customer/profile')}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
          <Separator className="my-1" />
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-2"
            onClick={() => window.open('https://support.example.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Help Center</span>
          </button>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full ${colors.icon} flex items-center justify-center mr-3 shadow-md`}>
                {orderDetails.statusCode === 1 ? (
                  <Clock className="h-5 w-5" />
                ) : orderDetails.statusCode === 2 ? (
                  <Package className="h-5 w-5" />
                ) : orderDetails.statusCode === 3 ? (
                  <Truck className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <Badge variant="outline" className={`font-medium ${colors.badge}`}>
                  {orderDetails.status}
                </Badge>
                <p className="text-sm text-gray-500 mt-1">
                  Estimated delivery: {orderDetails.estimated}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white border-purple-200 text-purple-600 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all"
              onClick={handleToggleChat}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with Store
            </Button>
          </div>
          
          <Progress 
            value={orderDetails.progress} 
            className="h-2 bg-gray-100 rounded-full overflow-hidden" 
            indicatorClassName={`${colors.bg} animate-pulse-subtle`}
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 relative z-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Order Details</CardTitle>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
                    Total: ${orderDetails.total.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="mt-2">
                  <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="details" onClick={() => setActiveTab('details')} className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow">Items</TabsTrigger>
                    <TabsTrigger value="shipping" onClick={() => setActiveTab('shipping')} className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow">Shipping</TabsTrigger>
                    <TabsTrigger value="payment" onClick={() => setActiveTab('payment')} className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow">Payment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 animate-fadeIn">
                    {orderDetails.items.map(item => (
                      <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md border border-gray-200 flex items-center justify-center text-xl mr-4 shadow-sm">
                          {item.image}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="font-medium text-purple-600">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${(orderDetails.total - orderDetails.shipping.fee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">${orderDetails.shipping.fee.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between py-2">
                        <span className="font-medium text-gray-900">Total:</span>
                        <span className="font-bold text-purple-600">${orderDetails.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="shipping" className="space-y-4 animate-fadeIn">
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">Shipping Address</h3>
                          <p className="text-gray-600">{orderDetails.shipping.address}</p>
                          <p className="text-gray-600">ZIP: {orderDetails.shipping.zipCode}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        <Truck className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">Shipping Method</h3>
                          <p className="text-gray-600">{orderDetails.shipping.method}</p>
                          <p className="text-gray-600">Estimated: {orderDetails.estimated}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-blue-900">Track your order</h3>
                          <p className="text-blue-700 text-sm mt-1">Once your order is shipped, you'll receive the tracking code here.</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payment" className="space-y-4 animate-fadeIn">
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        <CreditCard className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">Payment Information</h3>
                          <div className="space-y-2 mt-2">
                            <div className="flex justify-between py-1 border-b border-gray-200">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-medium">{orderDetails.payment.method}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                              <span className="text-gray-600">Card:</span>
                              <span>{orderDetails.payment.card}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                              <span className="text-gray-600">Installments:</span>
                              <span>{orderDetails.payment.installments}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-600">Status:</span>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {orderDetails.payment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        <Receipt className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">Receipt</h3>
                          <p className="text-gray-600 mb-3">You can request a receipt for this order at any time.</p>
                          <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all">
                            Request Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle>Your Experience</CardTitle>
                <CardDescription>How is your experience with this purchase?</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-4">
                <div className="flex justify-center space-x-3 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        orderRating >= star 
                          ? 'bg-purple-100 text-purple-600 scale-110 shadow-md' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      onClick={() => setOrderRating(star)}
                    >
                      <Star className={`h-6 w-6 ${orderRating >= star ? 'fill-purple-600' : ''}`} />
                    </button>
                  ))}
                </div>
                
                {orderRating > 0 && (
                  <div className="animate-fadeIn">
                    <p className="text-gray-700 mb-4">
                      {orderRating >= 4 ? 'Great! We\'re happy you\'re satisfied.' :
                       orderRating >= 3 ? 'Thank you for your rating! How can we improve?' :
                       'We\'re sorry your experience isn\'t ideal. How can we help?'}
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md">
                      Submit Rating
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6">
                  {orderDetails.timeline.map((event, index) => (
                    <div key={event.id} className="mb-8 relative">
                      {index < orderDetails.timeline.length - 1 && (
                        <div className={`absolute left-[-12px] top-3 w-0.5 h-full ${
                          event.completed ? colors.timeline : 'bg-gray-200'
                        }`}></div>
                      )}
                      
                      <div className={`absolute left-[-16px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        event.completed 
                          ? `${colors.bg} animate-completed-pulse shadow-md` 
                          : index === orderDetails.timeline.findIndex(e => !e.completed) 
                            ? 'bg-white border-2 border-purple-600 animate-current-pulse' 
                            : 'bg-gray-200'
                      }`}>
                        {event.completed && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-medium ${
                            event.completed 
                              ? 'text-gray-900' 
                              : index === orderDetails.timeline.findIndex(e => !e.completed)
                                ? colors.text
                                : 'text-gray-500'
                          }`}>{event.status}</h3>
                          <span className="text-sm text-gray-500">{event.date}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600">{event.description}</p>
                        
                        {event.time !== '---' && (
                          <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            <Clock className="inline-block h-3 w-3 mr-1" />
                            {event.time}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle>Store Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12 border border-gray-200 shadow-sm">
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                      {orderDetails.store.logo}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{orderDetails.store.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span>{orderDetails.store.rating} • Responds in ~{orderDetails.store.responseTime}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{orderDetails.store.contactEmail}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{orderDetails.store.contactPhone}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                  onClick={handleToggleChat}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with Store
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle>Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start font-normal hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                  >
                    <span className="mr-2">🛍️</span> Request return
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start font-normal hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                  >
                    <span className="mr-2">❓</span> Report a problem
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start font-normal hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                  >
                    <span className="mr-2">📝</span> View return policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 z-20 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button 
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors"
            onClick={() => navigate('/customer/dashboard')}
          >
            <Box className="h-6 w-6" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors"
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

      <button
        className={`fixed z-20 bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
          chatVisible 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
        }`}
        onClick={handleToggleChat}
      >
        {chatVisible ? (
          <LogOut className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </button>

      {chatVisible && (
        <div
          className={`fixed z-10 bg-white shadow-2xl transition-all ${
            floatingChat 
              ? 'w-80 h-[450px] rounded-2xl bottom-24 right-6 border border-gray-200 animate-slideIn' 
              : 'w-full h-96 bottom-0 left-0 right-0 border-t border-gray-200 sm:w-96 sm:right-6 sm:left-auto sm:rounded-t-2xl animate-slideUp'
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                {orderDetails.store.logo}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{orderDetails.store.name}</h3>
                <div className="flex items-center text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  <span className="text-green-600">Online • Responds in {orderDetails.store.responseTime}</span>
                </div>
              </div>
            </div>
            
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleFloatingChat}
            >
              {floatingChat ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14L21 3"></path>
                  <path d="M19 10v11H3V5h11"></path>
                </svg>
              )}
            </button>
          </div>
          
          <ScrollArea 
            id="chat-messages" 
            className="p-4 h-[calc(100%-120px)]"
          >
            {chatMessages.map((message, index) => {
              if (message.sender === 'system') {
                return (
                  <div key={index} className="text-center my-3">
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                      {message.content}
                    </span>
                  </div>
                );
              }
              
              const isUser = message.sender === 'user';
              
              return (
                <div key={index} className={`mb-4 max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'} animate-message-in`}>
                  <div className={`p-3 rounded-2xl ${
                    isUser 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={`flex items-center mt-1 text-xs text-gray-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{message.time}</span>
                    {isUser && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
          
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                size="icon" 
                className={`${
                  chatMessage.trim() 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } transition-colors`}
                disabled={!chatMessage.trim()}
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes completed-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); }
        }
        
        @keyframes current-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
          50% { box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.2); }
        }
        
        @keyframes message-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-heartbeat { animation: heartbeat 2s infinite ease-in-out; }
        .animate-slideIn { animation: slideIn 0.3s ease forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease forwards; }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
        .animate-pulse-subtle { animation: pulse-subtle 2s infinite; }
        .animate-completed-pulse { animation: completed-pulse 2s infinite; }
        .animate-current-pulse { animation: current-pulse 2s infinite; }
        .animate-message-in { animation: message-in 0.3s ease forwards; }
      `}</style>
    </div>
  );
};

export default OrderDetailsCustomer;