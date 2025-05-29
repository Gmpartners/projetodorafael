import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  MessageSquareIcon, 
  Settings, 
  UserIcon,
  PackageIcon,
  SearchIcon,
  BellIcon,
  AlertCircleIcon,
  TruckIcon,
  CheckSquareIcon,
  XCircleIcon,
  ChevronLeft,
  ChevronRight,
  Package2Icon,
  CopyIcon
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Sidebar = ({ userType = 'store' }) => {
  const location = useLocation();
  const { isCollapsed, isMobile, toggleSidebar, collapseSidebar, expandSidebar } = useSidebar();
  const { user, userProfile } = useAuth();
  const [expandedItem, setExpandedItem] = useState(null);
  
  useEffect(() => {
    if (location.pathname.includes('/orders')) {
      setExpandedItem('/store/orders');
    }
  }, [location]);
  
  const isActive = (path) => {
    if (path === '/store/dashboard' || path === '/customer/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpanded = (path) => {
    if (isCollapsed) {
      // Se a sidebar está colapsada, expandir primeiro
      expandSidebar();
      setExpandedItem(path);
    } else {
      if (expandedItem === path) {
        setExpandedItem(null);
      } else {
        setExpandedItem(path);
      }
    }
  };

  // Função para copiar User ID
  const copyUserId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      toast.success('User ID copiado para a área de transferência!');
    }
  };
  
  const storeNavItems = [
    { name: 'Dashboard', path: '/store/dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    
    { 
      name: 'Produtos', 
      path: '/store/products', 
      icon: <Package2Icon className="h-5 w-5" />
    },
    

    
    { 
      name: 'Mensagens', 
      path: '/store/chats', 
      icon: <MessageSquareIcon className="h-5 w-5" />
    },
    { 
      name: 'Notificações', 
      path: '/store/push-notifications', 
      icon: <BellIcon className="h-5 w-5" />
    },

  ];
  
  const customerNavItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    { name: 'Meus Pedidos', path: '/customer/orders', icon: <PackageIcon className="h-5 w-5" /> },
    { 
      name: 'Mensagens', 
      path: '/customer/chat', 
      icon: <MessageSquareIcon className="h-5 w-5" />
    },
    { name: 'Perfil', path: '/customer/profile', icon: <UserIcon className="h-5 w-5" /> },
  ];
  
  const navItems = userType === 'store' ? storeNavItems : customerNavItems;

  // Componente para item de menu com tooltip quando colapsado
  const NavItem = ({ item, children }) => {
    if (isCollapsed && !isMobile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {children}
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return children;
  };
  
  return (
    <div 
      className={cn(
        "transition-all duration-300 h-screen flex flex-col border-r border-zinc-100 bg-white shadow-sm",
        isCollapsed && !isMobile ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="font-semibold text-zinc-900">Rafael Portal</h1>
          </div>
        )}
        
        {isCollapsed && !isMobile && (
          <div className="mx-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-purple-600 rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>Rafael Portal</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {/* Botão de toggle - apenas em desktop */}
        {!isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className={cn(
                    "h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors",
                    isCollapsed && "mx-auto mt-2"
                  )}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <p>{isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-zinc-50">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              type="search" 
              placeholder="Pesquisar..." 
              className="pl-8 h-9 bg-zinc-50 border-zinc-200 focus-visible:ring-purple-500 placeholder:text-zinc-400 text-sm"
            />
          </div>
        </div>
      )}
      
      {isCollapsed && !isMobile && (
        <div className="px-2 py-3 border-b border-zinc-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-9 rounded-lg hover:bg-zinc-100">
                  <SearchIcon className="h-4 w-4 text-zinc-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <p>Pesquisar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {/* Navigation */}
      <ScrollArea className="flex-1 pt-2">
        <nav className="grid gap-1 px-2 pb-4">
          {navItems.map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <div className="mb-1">
                  {/* Menu item with submenu */}
                  <NavItem item={item}>
                    <button
                      onClick={() => toggleExpanded(item.path)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 text-left rounded-lg transition-all hover:bg-zinc-100 group",
                        (isActive(item.path) || expandedItem === item.path)
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-zinc-700",
                        isCollapsed && !isMobile && "justify-center px-2 py-2"
                      )}
                    >
                      <div className="flex items-center">
                        <span className={cn(
                          "flex-shrink-0 transition-colors",
                          (isActive(item.path) || expandedItem === item.path) ? "text-purple-600" : "text-zinc-600 group-hover:text-zinc-900"
                        )}>
                          {item.icon}
                        </span>
                        
                        {!isCollapsed && (
                          <span className="ml-3 text-sm font-medium">{item.name}</span>
                        )}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="flex items-center gap-2">
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform text-zinc-400",
                            (expandedItem === item.path || isActive(item.path)) && "rotate-90"
                          )} />
                        </div>
                      )}
                    </button>
                  </NavItem>

                  {/* Submenu items */}
                  {!isCollapsed && (expandedItem === item.path || isActive(item.path)) && (
                    <div className="mt-1 ml-8 space-y-0.5 animate-in slide-in-from-left-1 duration-200">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className="no-underline block"
                        >
                          <div className={cn(
                            "flex items-center justify-between w-full px-3 py-2 rounded-md transition-all hover:bg-zinc-100",
                            isActive(subItem.path)
                              ? "bg-purple-50 text-purple-700 font-medium border-l-2 border-purple-600"
                              : "text-zinc-600 hover:text-zinc-900"
                          )}>
                            <span className="text-sm">{subItem.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Regular menu item without submenu */
                <NavItem item={item}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-lg no-underline transition-all mb-1 group hover:bg-zinc-100",
                      isActive(item.path)
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-zinc-700",
                      isCollapsed && !isMobile && "justify-center px-2 py-2 relative"
                    )}
                  >
                    <div className="flex items-center">
                      <span className={cn(
                        "flex-shrink-0 transition-colors",
                        isActive(item.path) ? "text-purple-600" : "text-zinc-600 group-hover:text-zinc-900"
                      )}>
                        {item.icon}
                      </span>
                      
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      )}
                    </div>
                  </Link>
                </NavItem>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
      
      {/* User Profile */}
      <div className={cn(
        "p-3 mt-auto border-t border-zinc-100 bg-zinc-50/50",
        isCollapsed && !isMobile ? "flex flex-col items-center py-3 gap-1" : "flex flex-col gap-2"
      )}>
        {/* User ID Section - Sempre visível em destaque */}
    

        {/* Profile Section */}
        <div className={cn(
          isCollapsed && !isMobile ? "flex flex-col items-center gap-1" : "flex items-center gap-3"
        )}>
          {isCollapsed && !isMobile ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="w-8 h-8 border-2 border-purple-100 shadow-sm">
                    <AvatarImage src="https://i.pinimg.com/736x/09/7e/ef/097eefc0841bed88ddba155bad43d2e6.jpg" alt="User avatar" />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                      {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2) : (userType === 'store' ? "LS" : "CL")}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div className="text-left">
                    <p className="font-semibold">
                      {userProfile?.name || userProfile?.storeName || (userType === 'store' ? 'Loja Exemplo' : 'Cliente Exemplo')}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {user?.email || (userType === 'store' ? 'loja@exemplo.com' : 'cliente@exemplo.com')}
                    </p>
                    {user?.uid && (
                      <div className="mt-1 pt-1 border-t border-zinc-200">
                        <p className="text-xs text-emerald-600 font-mono">ID: {user.uid.substring(0, 8)}...</p>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <Avatar className="w-10 h-10 border-2 border-purple-100 shadow-sm">
                <AvatarImage src="https://i.pinimg.com/736x/09/7e/ef/097eefc0841bed88ddba155bad43d2e6.jpg" alt="User avatar" />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2) : (userType === 'store' ? "LS" : "CL")}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {userProfile?.name || userProfile?.storeName || (userType === 'store' ? 'Loja Exemplo' : 'Cliente Exemplo')}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {user?.email || (userType === 'store' ? 'loja@exemplo.com' : 'cliente@exemplo.com')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;