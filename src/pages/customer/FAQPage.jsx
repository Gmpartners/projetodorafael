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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  User,
  Box,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  HelpCircle
} from 'lucide-react';

// FAQ Categories 
const faqCategories = [
  {
    id: "orders",
    name: "Orders & Shipping",
    count: 12
  },
  {
    id: "returns",
    name: "Returns & Refunds",
    count: 8
  },
  {
    id: "products",
    name: "Products",
    count: 10
  },
  {
    id: "account",
    name: "Account & Payments",
    count: 6
  },
  {
    id: "other",
    name: "Other Questions",
    count: 4
  }
];

// FAQ data for each category
const faqData = {
  orders: [
    {
      id: "ord-1",
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account and navigating to the 'Orders' section. Click on the specific order to view its tracking information. Alternatively, you can use the tracking number provided in your shipping confirmation email on our carrier's website."
    },
    {
      id: "ord-2",
      question: "What shipping methods do you offer?",
      answer: "We offer several shipping methods including Standard Delivery (3-5 business days), Express Delivery (1-2 business days), and Same-Day Delivery in select areas. Shipping options and costs will be displayed during checkout based on your location and the items in your cart."
    },
    {
      id: "ord-3",
      question: "How long will it take to receive my order?",
      answer: "Delivery times depend on your location and the shipping method selected. Standard shipping typically takes 3-5 business days, while express shipping takes 1-2 business days. Please note that processing time (1-2 business days) is separate from shipping time."
    },
    {
      id: "ord-4",
      question: "Can I change my shipping address after placing an order?",
      answer: "Address changes may be possible if your order hasn't entered the shipping phase. Please contact our customer support team immediately through the chat feature or support center. If the order has already been shipped, we may not be able to modify the delivery address."
    }
  ],
  returns: [
    {
      id: "ret-1",
      question: "What is your return policy?",
      answer: "Our return policy allows you to return most items within 30 days of delivery for a full refund. Products must be in their original condition and packaging. Certain items like personalized products or intimate wellness products cannot be returned for health and safety reasons."
    },
    {
      id: "ret-2",
      question: "How do I start a return?",
      answer: "To initiate a return, go to your account, find the order containing the item you wish to return, and select 'Return Item'. Follow the instructions to print a return shipping label and packaging guidelines. You can also contact our support team for assistance with returns."
    },
    {
      id: "ret-3",
      question: "When will I receive my refund?",
      answer: "Once we receive your returned item, our team will inspect it and process your refund. This typically takes 3-5 business days. After processing, refunds will appear in your account within 5-10 business days, depending on your payment provider's policies."
    }
  ],
  products: [
    {
      id: "prod-1",
      question: "How do I know which supplement is right for me?",
      answer: "The best supplement for you depends on your specific health goals, diet, and lifestyle. We recommend consulting with a healthcare professional before starting any supplement regimen. Our product pages contain detailed information about each supplement's benefits and recommended usage to help you make an informed decision."
    },
    {
      id: "prod-2",
      question: "Are your products tested for quality and safety?",
      answer: "Yes, all our products undergo rigorous quality testing to ensure they meet the highest standards of safety and efficacy. We work with third-party labs to verify the purity and potency of our ingredients. Our manufacturing facilities follow Good Manufacturing Practices (GMP) as regulated by the FDA."
    },
    {
      id: "prod-3",
      question: "What ingredients are in your products?",
      answer: "Each product has a comprehensive ingredient list available on its respective product page. We pride ourselves on using high-quality, natural ingredients with no artificial colors or preservatives whenever possible. For detailed information about specific products, please refer to the product description or contact our support team."
    }
  ],
  account: [
    {
      id: "acc-1",
      question: "How do I reset my password?",
      answer: "To reset your password, click on the 'Forgot Password' link on the login page. Enter the email address associated with your account, and we'll send you instructions to create a new password. For security reasons, password reset links expire after 24 hours."
    },
    {
      id: "acc-2",
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. In select regions, we also offer payment installment options through services like Affirm or Klarna. All payments are processed securely through encrypted channels."
    }
  ],
  other: [
    {
      id: "oth-1",
      question: "Do you have a loyalty program?",
      answer: "Yes, we offer a rewards program where you earn points on every purchase. These points can be redeemed for discounts on future orders. You also receive bonus points for referring friends, writing product reviews, and celebrating your birthday with us. Join for free through your account settings."
    },
    {
      id: "oth-2",
      question: "How can I contact customer support?",
      answer: "Our customer support team is available through multiple channels. You can chat with us through the website, email us at support@example.com, or call us at 1-800-123-4567 during business hours (Monday-Friday, 9 AM - 6 PM EST). We aim to respond to all inquiries within 24 hours."
    }
  ]
};

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('orders');
  const [expandedFaqs, setExpandedFaqs] = useState([]);
  const [helpfulFaqs, setHelpfulFaqs] = useState([]);
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter FAQs based on search query
  const filteredFaqs = searchQuery.trim() ? 
    Object.values(faqData).flat().filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) : 
    faqData[activeCategory];
  
  // Handle helpful/not helpful feedback
  const handleFeedback = (faqId, isHelpful) => {
    if (helpfulFaqs.includes(faqId)) {
      setHelpfulFaqs(helpfulFaqs.filter(id => id !== faqId));
    } else {
      setHelpfulFaqs([...helpfulFaqs, faqId]);
    }
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

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white bg-white/10 hover:bg-white/20 mr-4 rounded-lg backdrop-blur-sm"
              onClick={() => navigate('/customer/support')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Support Center
            </Button>
            <h1 className="text-2xl font-bold text-white">Frequently Asked Questions</h1>
          </div>
          
          <div className="max-w-2xl">
            <p className="text-purple-100 mb-6">
              Find answers to common questions about our products and services
            </p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-200 h-5 w-5" />
              <Input
                placeholder="Search for answers..."
                className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 w-full rounded-lg shadow-md"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
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
        <div className="max-w-4xl mx-auto">
          {searchQuery ? (
            <div className="animate-fadeIn">
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden mb-6">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50 pb-3">
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    {filteredFaqs.length === 0 
                      ? 'No results found for your search' 
                      : `Found ${filteredFaqs.length} result${filteredFaqs.length === 1 ? '' : 's'} for "${searchQuery}"`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 shadow-inner">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                      <p className="mt-2 text-gray-500 max-w-md mx-auto">
                        Try using different keywords or browse our FAQ categories below
                      </p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
                        onClick={() => setSearchQuery('')}
                      >
                        Browse All FAQs
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {filteredFaqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-200 overflow-hidden">
                          <AccordionTrigger className="text-left font-medium hover:text-purple-700 py-4 px-4 rounded-t-lg hover:bg-purple-50/50 transition-colors">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 px-4 bg-white rounded-b-lg shadow-inner">
                            <div className="text-gray-700 mb-4">{faq.answer}</div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                Category: <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 ml-1 shadow-sm">
                                  {Object.keys(faqData).find(cat => 
                                    faqData[cat].some(item => item.id === faq.id)
                                  )?.charAt(0).toUpperCase() + Object.keys(faqData).find(cat => 
                                    faqData[cat].some(item => item.id === faq.id)
                                  )?.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Was this helpful?</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`px-2 ${helpfulFaqs.includes(faq.id) ? 'bg-green-50 text-green-700 border-green-200' : 'border-gray-200'}`}
                                  onClick={() => handleFeedback(faq.id, true)}
                                >
                                  <ThumbsUp className={`h-4 w-4 ${helpfulFaqs.includes(faq.id) ? 'text-green-600' : 'text-gray-400'}`} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="px-2 border-gray-200"
                                  onClick={() => handleFeedback(faq.id, false)}
                                >
                                  <ThumbsDown className="h-4 w-4 text-gray-400" />
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Categories sidebar */}
              <div className="md:col-span-1">
                <Card className="sticky top-4 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50 pb-2">
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {faqCategories.map((category) => (
                        <button
                          key={category.id}
                          className={`flex justify-between items-center px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                            activeCategory === category.id 
                              ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' 
                              : 'text-gray-700'
                          }`}
                          onClick={() => setActiveCategory(category.id)}
                        >
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 shadow-sm">
                            {category.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                    <Button 
                      variant="outline" 
                      className="w-full text-purple-600 hover:bg-purple-50 border-purple-200 shadow-sm"
                      onClick={() => navigate('/customer/support')}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* FAQ content */}
              <div className="md:col-span-3">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50 pb-3">
                    <CardTitle>{faqCategories.find(cat => cat.id === activeCategory)?.name}</CardTitle>
                    <CardDescription>
                      Frequently asked questions about {faqCategories.find(cat => cat.id === activeCategory)?.name.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="multiple" className="w-full">
                      {faqData[activeCategory].map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-200 overflow-hidden px-0">
                          <AccordionTrigger className="text-left font-medium hover:text-purple-700 py-4 px-6 hover:bg-purple-50/50 transition-colors">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-6 px-6 bg-white shadow-inner">
                            <div className="text-gray-700 mb-4">{faq.answer}</div>
                            <div className="flex items-center justify-end space-x-2">
                              <span className="text-sm text-gray-500">Was this helpful?</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={`px-2 ${helpfulFaqs.includes(faq.id) ? 'bg-green-50 text-green-700 border-green-200' : 'border-gray-200'}`}
                                onClick={() => handleFeedback(faq.id, true)}
                              >
                                <ThumbsUp className={`h-4 w-4 ${helpfulFaqs.includes(faq.id) ? 'text-green-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="px-2 border-gray-200"
                                onClick={() => handleFeedback(faq.id, false)}
                              >
                                <ThumbsDown className="h-4 w-4 text-gray-400" />
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                  <CardFooter className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
                    <div className="w-full text-center">
                      <p className="text-gray-500 mb-3">Can't find what you're looking for?</p>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
                        onClick={() => navigate('/customer/support')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Related articles */}
                <Card className="mt-6 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200/50">
                    <CardTitle>Related Articles</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({length: 4}).map((_, idx) => (
                        <button
                          key={idx}
                          className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left shadow-sm hover:shadow-md"
                        >
                          <h3 className="font-medium text-gray-900">
                            {[
                              'Understanding product ingredients',
                              'How to store supplements properly',
                              'Comparing supplement types',
                              'Best practices for supplement use'
                            ][idx]}
                          </h3>
                          <div className="flex justify-between items-center mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
                              Article
                            </Badge>
                            <span className="text-purple-600 flex items-center text-xs">
                              Read more
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;