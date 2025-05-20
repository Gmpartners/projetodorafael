import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { BellIcon, SearchIcon, MenuIcon, XIcon, MessageSquareIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";

const NotificationPanel = ({ notifications }) => {
  return (
    <div className="max-h-[300px] overflow-y-auto">
      {notifications.length > 0 ? (
        notifications.map((notification, i) => (
          <DropdownMenuItem key={i} className="flex flex-col items-start py-2 cursor-pointer hover:bg-zinc-50">
            <div className="flex w-full justify-between">
              <span className="font-medium">{notification.title}</span>
              <span className="text-xs text-zinc-500">{notification.time}</span>
            </div>
            <span className="text-sm text-zinc-600 mt-1">{notification.description}</span>
          </DropdownMenuItem>
        ))
      ) : (
        <div className="p-4 text-center text-zinc-500">
          Sem notificações no momento
        </div>
      )}
    </div>
  );
};

const MainLayout = ({ children, userType = 'store', pageTitle = "Dashboard" }) => {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const notifications = [
    {
      title: userType === 'store' ? 'Novo Pedido Recebido' : 'Pedido Atualizado',
      time: '2h atrás',
      description: userType === 'store' 
        ? 'Cliente #1234 realizou um pedido de R$99,99'
        : 'Seu pedido #5678 foi enviado e está a caminho'
    },
    {
      title: 'Nova Mensagem',
      time: '3h atrás',
      description: userType === 'store' 
        ? 'Cliente #5678 enviou uma mensagem sobre o pedido'
        : 'Loja Exemplo respondeu à sua mensagem'
    },
    {
      title: userType === 'store' ? 'Lembrete de Envio' : 'Entrega Confirmada',
      time: '5h atrás',
      description: userType === 'store' 
        ? '3 pedidos precisam ser enviados hoje'
        : 'Seu pedido #1234 foi entregue com sucesso'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Função para fechar sidebar mobile quando clicar fora
  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  // Função para toggle da sidebar mobile
  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 w-screen max-w-[100vw] box-border">
      {/* Desktop Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-20 transition-all duration-300",
        isMobile ? 'hidden' : 'block'
      )}>
        <Sidebar userType={userType} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleMobileSidebarClose}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div 
          className={cn(
            "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-50",
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar userType={userType} />
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col h-screen max-w-full overflow-hidden transition-all duration-300",
        isMobile 
          ? 'ml-0 w-full'
          : isCollapsed
            ? 'ml-16 w-[calc(100%-4rem)]'  // 4rem = 64px (w-16)
            : 'ml-64 w-[calc(100%-16rem)]' // 16rem = 256px (w-64)
      )}>
        {/* Header */}
        <header 
          className={cn(
            "px-4 py-3 bg-white border-b flex items-center justify-between sticky top-0 z-10 transition-all duration-200 w-full max-w-full overflow-hidden",
            scrolled ? 'shadow-sm border-zinc-200' : 'border-zinc-100'
          )}
        >
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleMobileSidebarToggle}
              className="mr-2 flex-shrink-0 hover:bg-zinc-100"
            >
              {isMobileSidebarOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </Button>
          )}

          {/* Left Side - Title and Search */}
          <div className="flex items-center space-x-4 flex-1 min-w-0 overflow-hidden">
            <h1 className="text-xl font-semibold text-zinc-900 hidden sm:block truncate">
              {pageTitle}
            </h1>
            
            <div className="relative max-w-md w-full hidden sm:block ml-6 flex-shrink">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input 
                type="search" 
                placeholder="Pesquisar pedidos, clientes..." 
                className="pl-8 h-9 bg-zinc-50 border-zinc-200 focus-visible:ring-purple-500 text-sm"
              />
            </div>
          </div>

          {/* Right Side - Notifications and User */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Messages Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-zinc-100 transition-colors">
                  <MessageSquareIcon className="h-5 w-5 text-zinc-700" />
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {userType === 'store' ? 5 : 2}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <MessageSquareIcon className="h-4 w-4" />
                  Mensagens
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <DropdownMenuItem key={i} className="flex items-start py-3 cursor-pointer hover:bg-zinc-50">
                      <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                        <AvatarImage src="https://i.pinimg.com/736x/09/7e/ef/097eefc0841bed88ddba155bad43d2e6.jpg" />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                          {userType === 'store' ? 'CL' : 'LS'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between w-full mb-1">
                          <span className="font-medium truncate text-sm">
                            {userType === 'store' ? `Cliente #${1000 + i}` : 'Loja Exemplo'}
                          </span>
                          <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">{i}h atrás</span>
                        </div>
                        <span className="text-sm text-zinc-600 truncate">
                          Olá, gostaria de saber sobre o status do meu pedido...
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <Button variant="ghost" className="w-full hover:bg-zinc-100 text-sm" asChild>
                    <a href={userType === 'store' ? '/store/chats' : '/customer/chat'}>
                      Ver todas as mensagens
                    </a>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-zinc-100 transition-colors">
                  <BellIcon className="h-5 w-5 text-zinc-700" />
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <BellIcon className="h-4 w-4" />
                  Notificações
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <NotificationPanel notifications={notifications} />
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <Button variant="ghost" className="w-full hover:bg-zinc-100 text-sm">
                    Marcar todas como lidas
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-1 hover:bg-zinc-100 transition-colors rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://i.pinimg.com/736x/09/7e/ef/097eefc0841bed88ddba155bad43d2e6.jpg" alt="User avatar" />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {userType === 'store' ? "LS" : "CL"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src="https://i.pinimg.com/736x/09/7e/ef/097eefc0841bed88ddba155bad43d2e6.jpg" alt="User avatar" />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {userType === 'store' ? "LS" : "CL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-sm">{userType === 'store' ? 'Loja Exemplo' : 'Cliente Exemplo'}</p>
                    <p className="text-xs text-zinc-500 truncate">{userType === 'store' ? 'loja@exemplo.com' : 'cliente@exemplo.com'}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-50">
                  <a href={userType === 'store' ? '/store/profile' : '/customer/profile'} className="w-full text-sm">
                    Perfil
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-50">
                  <a href={userType === 'store' ? '/store/settings' : '/customer/settings'} className="w-full text-sm">
                    Configurações
                  </a>
                </DropdownMenuItem>
                {userType === 'store' && (
                  <DropdownMenuItem className="cursor-pointer hover:bg-zinc-50">
                    <a href="/store/billing" className="w-full text-sm">
                      Faturamento
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-50 text-red-600 hover:text-red-700">
                  <a href="/logout" className="w-full text-sm">
                    Sair
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 w-full max-w-full bg-zinc-50">
          <div className="mx-auto w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;