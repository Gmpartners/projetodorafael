import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Mail, ArrowRight, Loader2, AlertCircle, Package } from 'lucide-react';
import { apiService } from '@/services/apiService';

const CustomerLookup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Looking for orders for:', email);
      
      const response = await apiService.lookupCustomerByEmail(email);
      
      if (response.success && response.data) {
        // Store customer data in localStorage for dashboard
        localStorage.setItem('customerEmail', email);
        localStorage.setItem('customerData', JSON.stringify(response.data));
        
        console.log('✅ Customer found, redirecting to dashboard');
        
        // Navigate to customer dashboard
        navigate('/customer/dashboard');
      } else {
        setError('No orders found for this email');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      
      if (error.response?.status === 404) {
        setError('No orders found for this email');
      } else if (error.response?.status === 400) {
        setError('Please enter a valid email');
      } else {
        setError('Unable to search for your orders. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Orders</h1>
          <p className="text-gray-600">Enter your email to view status and updates for your orders</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-6">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email used for purchase
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching Orders...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search My Orders
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
            Real-time tracking
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
            Direct chat with store
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
            Instant notifications
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Secure and private • No registration required
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLookup;