import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare,
  ArrowRight,
  User,
  Bell, 
  Mail,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: null,
    phone: "+1 (555) 123-4567",
    address: "1578 Paulista Ave, Apt 502, Sao Paulo",
    memberSince: "Jan 2023",
    orderCount: 12,
    accountType: "Standard"
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
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Header decoration elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10 flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-white/20 mb-4 shadow-xl">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-3xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-purple-100 mt-1">{user.email}</p>
          
          <Badge className="mt-3 bg-white/10 text-white border-white/20 px-3 py-1 backdrop-blur-sm">
            Member since {user.memberSince}
          </Badge>
        </div>

        {/* Curved divider */}
        <div className="h-16 bg-gradient-to-b from-purple-700/0 to-white relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 text-white">
            <path fill="currentColor" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,197.3C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 pb-20 -mt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Navigation sidebar */}
          <div className="md:col-span-1">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <button 
                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors ${activeTab === 'profile' ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' : 'text-gray-700'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile Information</span>
                  </button>
                  
                  <button 
                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors ${activeTab === 'orders' ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' : 'text-gray-700'}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">Order History</span>
                  </button>
                  
                  <button 
                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors ${activeTab === 'messages' ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' : 'text-gray-700'}`}
                    onClick={() => setActiveTab('messages')}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">Messages</span>
                    <Badge className="ml-auto bg-red-500 text-white border-none text-xs px-2 shadow-sm">3</Badge>
                  </button>
                  
                  <button 
                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors ${activeTab === 'notifications' ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' : 'text-gray-700'}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="font-medium">Notifications</span>
                    <Badge className="ml-auto bg-red-500 text-white border-none text-xs px-2 shadow-sm">2</Badge>
                  </button>
                  
                  <button 
                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 transition-colors ${activeTab === 'settings' ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' : 'text-gray-700'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Account Settings</span>
                  </button>
                  
                  <button 
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors mt-auto"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Full Name</div>
                      <div className="text-base text-gray-900 p-2 bg-gray-50 rounded-md shadow-inner">{user.name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Email Address</div>
                      <div className="text-base text-gray-900 p-2 bg-gray-50 rounded-md flex items-center shadow-inner">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Phone Number</div>
                      <div className="text-base text-gray-900 p-2 bg-gray-50 rounded-md shadow-inner">{user.phone}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Account Type</div>
                      <div className="text-base text-gray-900 p-2 bg-gray-50 rounded-md shadow-inner">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 shadow-sm">
                          {user.accountType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Shipping Address</div>
                    <div className="text-base text-gray-900 p-2 bg-gray-50 rounded-md shadow-inner">{user.address}</div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md">
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === 'orders' && (
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View details of your previous orders</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">Order #{(1000 + idx).toString()}</h3>
                            <p className="text-sm text-gray-500 mt-1">Placed on May {18 - idx}, 2025</p>
                          </div>
                          <Badge className={idx === 0 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                            : idx === 1 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                              : 'bg-gradient-to-r from-green-500 to-green-600'
                          }>
                            {idx === 0 ? 'In Preparation' : idx === 1 ? 'On the Way' : 'Delivered'}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="text-gray-900 font-medium ml-1">${(100 + idx * 50).toFixed(2)}</span>
                          </div>
                          <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50 shadow-sm hover:shadow">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center p-6 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                  <Button variant="outline" className="text-purple-600 hover:bg-purple-50 border-purple-200 shadow-sm">
                    View All Orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === 'messages' && (
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Your conversations with stores</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className={`p-3 border rounded-lg flex items-start space-x-3 hover:bg-purple-50 cursor-pointer transition-all shadow-sm hover:shadow-md ${idx < 2 ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
                        <Avatar className="h-10 w-10 border border-white shadow-sm">
                          <AvatarFallback className={`${[
                            'bg-gradient-to-br from-green-100 to-green-200 text-green-600', 
                            'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600', 
                            'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600', 
                            'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600'
                          ][idx % 4]}`}>
                            {['E', 'V', 'N', 'H'][idx % 4]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-900 truncate">
                              {['Essência Natural', 'VitaMax Suplementos', 'Nature Health', 'Herbal Life'][idx % 4]}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {['10m ago', '2h ago', 'Yesterday', '3 days ago'][idx]}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {[
                              'Your order is being prepared and will be shipped soon!',
                              'We\'ve sent your order. Here\'s the tracking number...',
                              'Thank you for your order! We hope you enjoy your products.',
                              'Is there anything else you need help with?'
                            ][idx % 4]}
                          </p>
                          
                          {idx < 2 && (
                            <Badge className="mt-2 bg-purple-100 text-purple-700 border-none text-xs">New message</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center p-6 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                  <Button variant="outline" className="text-purple-600 hover:bg-purple-50 border-purple-200 shadow-sm">
                    View All Messages
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Stay updated with your orders and messages</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className={`p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-all shadow-sm hover:shadow-md ${idx < 2 ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-inner ${
                            idx % 3 === 0 ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' : 
                            idx % 3 === 1 ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600' : 
                            'bg-gradient-to-br from-green-100 to-green-200 text-green-600'
                          }`}>
                            {idx % 3 === 0 ? <Bell className="h-4 w-4" /> : 
                             idx % 3 === 1 ? <MessageSquare className="h-4 w-4" /> : 
                             <FileText className="h-4 w-4" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-gray-900">
                                {idx % 3 === 0 ? 'Order Status Update' : 
                                 idx % 3 === 1 ? 'New Message' : 
                                 'Order Completed'}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {['10m ago', '30m ago', '2h ago', 'Yesterday', '2 days ago'][idx]}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {idx % 3 === 0 ? 'Your order #10' + (idx + 1) + ' status has been updated to ' + (idx === 0 ? '"In Preparation"' : '"On the Way"') : 
                               idx % 3 === 1 ? 'You have a new message from ' + ['Essência Natural', 'VitaMax Suplementos'][idx % 2] : 
                               'Your order #10' + (idx + 1) + ' has been delivered successfully!'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-6 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                  <Button variant="outline" className="text-purple-600 hover:bg-purple-50 border-purple-200 shadow-sm">
                    Mark All as Read
                  </Button>
                  <Button variant="outline" className="text-purple-600 hover:bg-purple-50 border-purple-200 shadow-sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg shadow-sm">
                        <div>
                          <p className="text-gray-700 font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive order updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg shadow-sm">
                        <div>
                          <p className="text-gray-700 font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive order updates via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg shadow-sm">
                        <div>
                          <p className="text-gray-700 font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Security</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start text-gray-700 hover:bg-purple-50 border-gray-200 shadow-sm">
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-gray-700 hover:bg-purple-50 border-gray-200 shadow-sm">
                        Two-Factor Authentication
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-gray-700 hover:bg-purple-50 border-gray-200 shadow-sm">
                        Manage Connected Devices
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md">
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Navigation bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 md:hidden z-20 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button 
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors"
            onClick={() => window.location.href = '/customer/dashboard'}
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs mt-1">Orders</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition-colors"
            onClick={() => window.location.href = '/customer/chat'}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-purple-600"
            onClick={() => window.location.href = '/customer/profile'}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;