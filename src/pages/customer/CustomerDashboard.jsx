import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  MessageSquare,
  Clock,
  Search,
  ArrowRight,
  Headphones,
  Bell,
  Box,
  User,
  ShieldCheck,
  Home,
  Settings,
  X
} from 'lucide-react';

// Mock data for demonstration
const storeData = [
  {
    id: 1,
    name: "Essência Natural",
    logo: "🌿",
    accent: "#4CAF50",
    verified: true,
    products: ["Nature Burn Encapsulado"],
    status: "In Preparation",
    statusCode: 2,
    date: "May 18",
    estimated: "May 21",
    progress: 40,
    hasMessages: true,
    orderCode: "#EN-7845"
  },
  {
    id: 2,
    name: "VitaMax Suplementos",
    logo: "💪",
    accent: "#3F51B5",
    verified: true,
    products: ["Whey Protein Premium"],
    status: "On the way",
    statusCode: 3, 
    date: "May 16",
    estimated: "May 19",
    progress: 75,
    hasMessages: false,
    orderCode: "#VM-3219"
  }
];

// Notification data
const notificationData = [
  {
    id: 1,
    type: "order",
    title: "Order Shipped",
    message: "Your order #EN-7845 has been shipped!",
    time: "10 min ago",
    read: false,
    orderId: 1
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "Essência Natural: Your order is being prepared...",
    time: "30 min ago",
    read: false,
    storeId: 1
  },
  {
    id: 3,
    type: "order",
    title: "Order Delivered",
    message: "Your order #VM-3219 will be delivered today!",
    time: "1 hour ago",
    read: true,
    orderId: 2
  },
  {
    id: 4,
    type: "message",
    title: "New Message",
    message: "VitaMax: Your order is on the way!",
    time: "2 hours ago",
    read: true,
    storeId: 2
  }
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [userName, setUserName] = useState('John');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(notificationData);
  const [unreadNotifications, setUnreadNotifications] = useState(
    notifications.filter(n => !n.read).length
  );

  useEffect(() => {
    // Simulating data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setUnreadNotifications(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const getStatusColor = (statusCode) => {
    switch(statusCode) {
      case 1: return "bg-amber-500 hover:bg-amber-600"; // Pending
      case 2: return "bg-blue-500 hover:bg-blue-600";   // In preparation
      case 3: return "bg-purple-600 hover:bg-purple-700"; // On the way
      case 4: return "bg-green-500 hover:bg-green-600";  // Delivered
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusBg = (statusCode) => {
    switch(statusCode) {
      case 1: return "bg-amber-50 text-amber-700 border-amber-200"; 
      case 2: return "bg-blue-50 text-blue-700 border-blue-200";   
      case 3: return "bg-purple-50 text-purple-700 border-purple-200"; 
      case 4: return "bg-green-50 text-green-700 border-green-200";  
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredStores = storeData.filter(store => {
    const matchesSearch = 
      searchText === '' || 
      store.name.toLowerCase().includes(searchText.toLowerCase()) ||
      store.products.some(p => p.toLowerCase().includes(searchText.toLowerCase())) ||
      store.orderCode.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'pending' && (store.statusCode === 1 || store.statusCode === 2)) ||
      (filterStatus === 'shipped' && store.statusCode === 3) ||
      (filterStatus === 'delivered' && store.statusCode === 4);
      
    return matchesSearch && matchesFilter;
  });

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? {...n, read: true} : n
    );
    setNotifications(updatedNotifications);
    
    // Navigate based on notification type
    if (notification.type === "order" && notification.orderId) {
      navigate(`/customer/orders/${notification.orderId}`);
    } else if (notification.type === "message" && notification.storeId) {
      navigate(`/customer/chat/${notification.storeId}`);
    }
    
    // Close notification panel
    setShowNotifications(false);
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({...n, read: true}));
    setNotifications(updatedNotifications);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative">
      {/* Pattern background */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 relative overflow-hidden">
        {/* Header background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10"></div>
        </div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 shadow-md">
                <Box className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Order Portal</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1 -translate-y-1 shadow-md">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              <Avatar className="h-9 w-9 border-2 border-white/20 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Hello, {userName}</h2>
              <p className="text-purple-100">Welcome to your order portal</p>
            </div>
            
            <div className="w-full md:w-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-200 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                className="pl-9 pr-4 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 w-full md:w-64 rounded-lg shadow-md"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          {/* Order summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-sm border-transparent hover:bg-white/15 transition-all duration-300 rounded-xl shadow-lg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">7</p>
                  <p className="text-xs md:text-sm text-purple-100">Total Orders</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center animate-pulse shadow-inner">
                  <Box className="h-5 w-5 text-white" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-transparent hover:bg-white/15 transition-all duration-300 rounded-xl shadow-lg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">3</p>
                  <p className="text-xs md:text-sm text-purple-100">In Progress</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center animate-pulse shadow-inner">
                  <Truck className="h-5 w-5 text-white" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-transparent hover:bg-white/15 transition-all duration-300 rounded-xl shadow-lg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">4</p>
                  <p className="text-xs md:text-sm text-purple-100">Completed</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center animate-pulse shadow-inner">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-transparent hover:bg-white/15 transition-all duration-300 rounded-xl shadow-lg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">12</p>
                  <p className="text-xs md:text-sm text-purple-100">Messages</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center animate-pulse shadow-inner">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Curved divider */}
        <div className="h-16 bg-gradient-to-b from-purple-700/0 to-white relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 text-white">
            <path fill="currentColor" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,197.3C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute top-20 right-4 z-50 w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slideIn">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
            <h3 className="font-semibold text-purple-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadNotifications > 0 && (
                <button 
                  className="text-xs text-purple-600 hover:text-purple-800"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ScrollArea className="h-80">
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 shadow-inner">
                    <Bell className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <button
                    key={notification.id}
                    className={`w-full p-3 mb-1 rounded-lg flex items-start hover:bg-purple-50 transition-colors shadow-sm hover:shadow-md ${
                      !notification.read ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-inner ${
                      notification.type === 'message' 
                        ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600' 
                        : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                    }`}>
                      {notification.type === 'message' ? (
                        <MessageSquare className="h-5 w-5" />
                      ) : (
                        <Package className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-purple-600 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 pb-20 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:shadow-2xl transition-all duration-300">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Your Recent Orders
                </h2>
                <p className="text-sm text-gray-500">Track your orders and interact with stores</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterStatus === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md' 
                    : 'text-gray-600 border-gray-200 shadow-sm'}
                >
                  View All
                </Button>
                <Button 
                  variant={filterStatus === 'pending' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                  className={filterStatus === 'pending' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md' 
                    : 'text-gray-600 border-gray-200 shadow-sm'}
                >
                  In Progress
                </Button>
                <Button 
                  variant={filterStatus === 'shipped' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterStatus('shipped')}
                  className={filterStatus === 'shipped' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md' 
                    : 'text-gray-600 border-gray-200 shadow-sm'}
                >
                  On the Way
                </Button>
                <Button 
                  variant={filterStatus === 'delivered' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterStatus('delivered')}
                  className={filterStatus === 'delivered' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md' 
                    : 'text-gray-600 border-gray-200 shadow-sm'}
                >
                  Delivered
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="mt-4 h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 shadow-inner">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-gray-500">No orders match your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStores.map((store) => (
                  <Card 
                    key={store.id}
                    className="border border-gray-200 hover:border-purple-200 transition-all group cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 rounded-xl overflow-hidden"
                    onClick={() => navigate(`/customer/orders/${store.id}`)}
                  >
                    <div className="flex items-start p-4 gap-4">
                      {/* Store logo */}
                      <div 
                        className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-xl relative shadow-md"
                        style={{ background: `linear-gradient(135deg, ${store.accent}15, ${store.accent}25)` }}
                      >
                        {store.logo}
                        {store.hasMessages && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping shadow-md"></span>
                        )}
                      </div>
                      
                      {/* Store details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900">{store.name}</h3>
                            {store.verified && (
                              <Badge variant="outline" className="ml-2 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{store.date}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">{store.orderCode}</span> • {store.products.join(", ")}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className={getStatusBg(store.statusCode)}>
                            {store.status}
                          </Badge>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Estimated: {store.estimated}
                          </div>
                        </div>
                        
                        <Progress 
                          value={store.progress} 
                          className="h-1.5 bg-gray-100 rounded-full overflow-hidden" 
                          indicatorClassName={
                            store.statusCode === 1 
                              ? "bg-gradient-to-r from-amber-500 to-amber-600" 
                              : store.statusCode === 2 
                                ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                                : store.statusCode === 3 
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600" 
                                  : "bg-gradient-to-r from-green-500 to-green-600"
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-2 flex justify-end space-x-2 border-t border-gray-100 group-hover:bg-gradient-to-r from-purple-50 to-indigo-50 transition-colors">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 text-xs shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/chat/${store.id}`);
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        Chat
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 text-xs shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/orders/${store.id}`);
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help center section */}
        <div className="mt-10">
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-gray-100/80 overflow-hidden transform hover:scale-[1.01] transition-all duration-300 shadow-lg rounded-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-16 h-16 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-2xl mr-6 shadow-inner animate-pulse">
                    <Headphones className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
                    <p className="text-gray-600 mt-1">Support Center available to help with your questions</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex-1 md:flex-none transform hover:translate-x-1 transition-transform shadow-md"
                    onClick={() => navigate('/customer/support')}
                  >
                    Start Conversation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white text-purple-600 border-purple-200 hover:bg-purple-50 flex-1 md:flex-none shadow-sm"
                    onClick={() => navigate('/customer/faq')}
                  >
                    View FAQs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Navigation bar for mobile and desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 z-20 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button 
            className="flex flex-col items-center text-purple-600"
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

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;