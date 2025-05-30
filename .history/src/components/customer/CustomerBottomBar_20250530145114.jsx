import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, MessageSquare, User, ArrowLeft } from 'lucide-react';

const CustomerBottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get customer data from localStorage
  const customerEmail = localStorage.getItem('customerEmail');
  const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
  const stats = customerData?.stats || {};

  // Navigation structure as planned
  const navigationItems = [
    {
      id: 'orders',
      label: 'Orders', 
      icon: Package,
      path: '/customer/dashboard',
      badge: null
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare, 
      path: '/customer/chat-list',
      badge: 'messages'
    },

  ];

  // Function to get badge count
  const getBadgeCount = (badgeType) => {
    switch(badgeType) {
      case 'messages': return stats.messages || 0;
      case 'orders': return stats.inProgress || 0;
      default: return 0;
    }
  };

  // Function to check if item is active
  const isActive = (item) => {
    if (item.action === 'logout') return false;
    return location.pathname === item.path;
  };

  // Smart navigation function
  const handleNavigation = (item) => {
    if (item.action === 'logout') {
      // Centralized logout function
      localStorage.removeItem('customerEmail');
      localStorage.removeItem('customerData');
      navigate('/customer/lookup');
      return;
    }

    // Normal navigation preserving state
    navigate(item.path, { 
      state: { 
        customerEmail, 
        customerData 
      } 
    });
  };

  // Don't render if no customer data
  if (!customerEmail) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-4 py-2 z-50">
      <div className="flex justify-center items-center max-w-sm mx-auto">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const badgeCount = item.badge ? getBadgeCount(item.badge) : 0;
          const active = isActive(item);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`
                flex flex-col items-center p-3 transition-all duration-200 relative
                ${active 
                  ? 'text-blue-600' 
                  : item.action === 'logout' 
                    ? 'text-slate-400 hover:text-slate-600' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }
                ${item.id === 'messages' ? 'mx-6' : ''}
                rounded-lg min-w-[60px]
              `}
            >
              {/* Icon */}
              <div className="relative">
                <IconComponent className="h-5 w-5" />
                
                {/* Notification badge */}
                {badgeCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs text-white font-medium">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span className="text-xs mt-1 font-medium">
                {item.label}
              </span>
              
              {/* Active indicator */}
              {active && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerBottomBar;