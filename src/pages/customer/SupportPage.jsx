import React, { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MessageSquare,
  User,
  Box,
  Search,
  Headphones,
  Phone,
  Mail,
  Clock,
  PlayCircle,
  FileText,
  Send,
  Paperclip,
  Image,
  HelpCircle,
  ChevronRight,
  X
} from 'lucide-react';

const supportAgents = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Customer Support",
    avatar: null,
    status: "online",
    specialties: ["Orders", "Returns"],
    rating: 4.9,
    responseTime: "~5 min"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    position: "Product Specialist",
    avatar: null,
    status: "online",
    specialties: ["Product Information", "Usage"],
    rating: 4.8,
    responseTime: "~10 min"
  },
  {
    id: 3,
    name: "Emily Chen",
    position: "Technical Support",
    avatar: null,
    status: "offline",
    specialties: ["Account Issues", "Website Help"],
    rating: 4.7,
    responseTime: "~15 min"
  }
];

const supportCategories = [
  {
    id: "orders",
    name: "Orders & Delivery",
    icon: <Box className="h-5 w-5" />,
    description: "Track orders, delivery issues, and shipping information",
    articles: 24
  },
  {
    id: "returns",
    name: "Returns & Refunds",
    icon: <FileText className="h-5 w-5" />,
    description: "Return policies, refund processes, and product exchanges",
    articles: 18
  },
  {
    id: "products",
    name: "Product Information",
    icon: <HelpCircle className="h-5 w-5" />,
    description: "Details about products, usage instructions, and ingredients",
    articles: 32
  },
  {
    id: "account",
    name: "Account & Security",
    icon: <User className="h-5 w-5" />,
    description: "Account settings, password resets, and privacy concerns",
    articles: 15
  }
];

const quickHelpArticles = [
  {
    id: 1,
    title: "How to track your order",
    category: "Orders & Delivery",
    views: 5240
  },
  {
    id: 2,
    title: "Return process explained",
    category: "Returns & Refunds",
    views: 4180
  },
  {
    id: 3,
    title: "Changing your shipping address",
    category: "Orders & Delivery",
    views: 3920
  },
  {
    id: 4,
    title: "Product usage guidelines",
    category: "Product Information",
    views: 3650
  }
];

const SupportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('help-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  
  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
  };
  
  const startChat = () => {
    setChatStarted(true);
    
    setChatMessages([
      {
        id: 1,
        sender: "agent",
        content: `Hi there! I'm ${selectedAgent.name} from Customer Support. How can I help you today?`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isNew: true
      }
    ]);
  };
  
  const sendMessage = () => {
    if (!supportMessage.trim()) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      content: supportMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isNew: true
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setSupportMessage('');
    
    setTimeout(() => {
      const agentResponse = {
        id: chatMessages.length + 2,
        sender: "agent",
        content: "Thank you for reaching out. I'm looking into your question and will have an answer for you shortly. Is there anything specific about your issue that you'd like to share?",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isNew: true
      };
      
      setChatMessages(prevMessages => [...prevMessages, agentResponse]);
    }, 2000);
  };
  
  const filteredArticles = searchQuery ? 
    quickHelpArticles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) : 
    quickHelpArticles;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
      {/* Pattern background */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
      </div>
      
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 relative overflow-hidden">
        {/* Header background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white bg-white/10 hover:bg-white/20 mr-4 rounded-lg backdrop-blur-sm"
              onClick={() => navigate('/customer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-white">Support Center</h1>
          </div>
          
          <div className="max-w-2xl">
            <p className="text-purple-100 mb-6">
              Get help with your orders, account, or product inquiries
            </p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-200 h-5 w-5" />
              <Input
                placeholder="Search for help articles..."
                className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 w-full rounded-lg shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="h-16 bg-gradient-to-b from-purple-700/0 to-white relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 text-white">
            <path fill="currentColor" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,197.3C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-20 -mt-6 relative z-10">
        <Tabs defaultValue="help-center" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-8 bg-gray-100/80 backdrop-blur-sm rounded-lg p-1 shadow-md">
            <TabsTrigger value="help-center" className="text-sm sm:text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow">
              Help Center
            </TabsTrigger>
            <TabsTrigger value="contact-support" className="text-sm sm:text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow">
              Contact Support
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="help-center" className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                    <CardTitle>Browse Help Topics</CardTitle>
                    <CardDescription>Find answers to common questions</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {supportCategories.map(category => (
                        <button
                          key={category.id}
                          className="flex flex-col h-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 shadow-inner">
                              {category.icon}
                            </div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 flex-grow">{category.description}</p>
                          <div className="flex justify-between items-center mt-auto text-sm">
                            <span className="text-gray-500">{category.articles} articles</span>
                            <span className="text-purple-600 flex items-center">
                              View
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                    <CardTitle>Video Guides</CardTitle>
                    <CardDescription>Watch tutorials and how-to videos</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({length: 4}).map((_, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-lg border border-gray-200 cursor-pointer transition-all hover:shadow-md">
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-md">
                                <PlayCircle className="h-8 w-8" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                              {['How to Track Your Order', 'Processing Returns', 'Understanding Product Labels', 'Account Security Tips'][idx]}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {['2:45', '3:12', '4:30', '2:15'][idx]} • {['5.2K', '3.8K', '4.1K', '2.9K'][idx]} views
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30 p-4">
                    <Button variant="outline" className="w-full text-purple-600 hover:bg-purple-50 border-purple-200">
                      View All Videos
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                    <CardTitle>Quick Help</CardTitle>
                    <CardDescription>Most viewed articles</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {filteredArticles.length > 0 ? (
                        filteredArticles.map(article => (
                          <button key={article.id} className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md">
                            <h4 className="font-medium text-gray-900">{article.title}</h4>
                            <div className="flex justify-between items-center mt-2 text-sm">
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                {article.category}
                              </Badge>
                              <span className="text-gray-500">{article.views.toLocaleString()} views</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <Search className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No articles found</p>
                          <p className="text-sm text-gray-400 mt-1">Try different search terms</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30 p-4">
                    <Button 
                      variant="outline" 
                      className="w-full text-purple-600 hover:bg-purple-50 border-purple-200"
                      onClick={() => navigate('/customer/faq')}
                    >
                      View All Articles
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="mt-6 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50 pb-2">
                    <CardTitle>Contact Methods</CardTitle>
                    <CardDescription>Alternative ways to get support</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 shadow-inner">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Phone Support</h4>
                          <p className="text-sm text-gray-600">Available Mon-Fri, 9am-5pm</p>
                        </div>
                      </button>
                      
                      <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 shadow-inner">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Email Support</h4>
                          <p className="text-sm text-gray-600">Response within 24 hours</p>
                        </div>
                      </button>
                      
                      <button 
                        className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
                        onClick={() => setActiveTab('contact-support')}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 shadow-inner">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Live Chat</h4>
                          <p className="text-sm text-gray-600">Talk to an agent now</p>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contact-support" className="animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {!selectedAgent && (
                <div className="md:col-span-12">
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                      <CardTitle>Support Agents</CardTitle>
                      <CardDescription>Select an agent to start your conversation</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {supportAgents.map(agent => (
                          <button
                            key={agent.id}
                            className={`p-4 border rounded-lg flex flex-col items-center text-center transition-all ${
                              agent.status === 'online' 
                                ? 'border-green-200 hover:border-green-300 hover:bg-green-50' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            } shadow-sm hover:shadow-md`}
                            onClick={() => agent.status === 'online' && handleAgentSelect(agent)}
                            disabled={agent.status !== 'online'}
                          >
                            <Avatar className="h-16 w-16 mb-3 border-2 border-white shadow-md">
                              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 text-lg">
                                {agent.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <h3 className="font-medium text-gray-900">{agent.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{agent.position}</p>
                            
                            {agent.status === 'online' ? (
                              <Badge className="bg-green-500 shadow-sm">Available Now</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500 border-gray-200">Offline</Badge>
                            )}
                            
                            <div className="flex items-center mt-3 text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Response time: {agent.responseTime}</span>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                              {agent.specialties.map(specialty => (
                                <Badge 
                                  key={specialty}
                                  variant="outline" 
                                  className="bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {selectedAgent && (
                <>
                  <div className="md:col-span-4 lg:col-span-3">
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>Support Agent</CardTitle>
                          {!chatStarted && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedAgent(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Change
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-3 border-2 border-white shadow-md">
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 text-lg">
                              {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <h3 className="font-medium text-gray-900">{selectedAgent.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{selectedAgent.position}</p>
                          
                          <div className="flex items-center text-sm mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <svg 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= Math.floor(selectedAgent.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-gray-600">{selectedAgent.rating}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 mb-4">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>Response time: {selectedAgent.responseTime}</span>
                          </div>
                          
                          <div className="w-full mt-2">
                            <Separator className="my-4" />
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">Available via chat</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700">Can send email follow-ups</span>
                              </div>
                              <div className="flex items-start text-sm">
                                <HelpCircle className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                <span className="text-gray-700">Specializes in: {selectedAgent.specialties.join(', ')}</span>
                              </div>
                            </div>
                            
                            {!chatStarted && (
                              <Button 
                                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
                                onClick={startChat}
                              >
                                Start Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="md:col-span-8 lg:col-span-9">
                    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50 pb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Customer Support</CardTitle>
                            <CardDescription>
                              {chatStarted ? 'Chat with ' + selectedAgent.name : 'Tell us how we can help you'}
                            </CardDescription>
                          </div>
                          
                          {chatStarted && (
                            <Badge className="bg-green-500 shadow-sm">
                              <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
                              Live Chat
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      {!chatStarted ? (
                        <CardContent className="flex-1 p-6">
                          <div className="space-y-4 py-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject
                              </label>
                              <Input placeholder="What do you need help with?" className="border-gray-200 focus:border-purple-300 focus:ring-purple-200" />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message
                              </label>
                              <Textarea 
                                placeholder="Please describe your issue in detail..." 
                                className="min-h-[120px] border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order Number (Optional)
                              </label>
                              <Input placeholder="e.g. #1234" className="border-gray-200 focus:border-purple-300 focus:ring-purple-200" />
                            </div>
                            
                            <div className="pt-2">
                              <Button 
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
                                onClick={startChat}
                              >
                                Submit & Start Chat
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      ) : (
                        <>
                          <ScrollArea className="flex-1 p-4 h-[400px]">
                            <div className="space-y-4">
                              {chatMessages.map((msg, idx) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${msg.isNew ? 'animate-message-in' : ''}`}
                                >
                                  {msg.sender === 'agent' && (
                                    <Avatar className="h-8 w-8 mr-2 flex-shrink-0 mt-1 border border-white shadow-sm">
                                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 text-xs">
                                        {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  
                                  <div className={`max-w-[80%]`}>
                                    <div className={`rounded-lg p-3 ${
                                      msg.sender === 'user' 
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md' 
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                                    }`}>
                                      <p className="text-sm">{msg.content}</p>
                                    </div>
                                    
                                    <div className={`flex items-center mt-1 text-xs text-gray-400 ${
                                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                    }`}>
                                      <span>{msg.time}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                          
                          <div className="p-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline"
                                size="icon"
                                className="flex-shrink-0 border-gray-200 text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                              >
                                <Paperclip className="h-5 w-5" />
                              </Button>
                              
                              <Input
                                placeholder="Type your message..."
                                value={supportMessage}
                                onChange={(e) => setSupportMessage(e.target.value)}
                                className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    sendMessage();
                                  }
                                }}
                              />
                              
                              <Button 
                                className={supportMessage.trim() 
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md' 
                                  : 'bg-gray-300 cursor-not-allowed'}
                                disabled={!supportMessage.trim()}
                                onClick={sendMessage}
                              >
                                <Send className="h-5 w-5 mr-2" />
                                Send
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </Card>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
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

export default SupportPage;