import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { MenuIcon, XIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";

const MainLayout = ({ children, userType = 'store', pageTitle = "Dashboard" }) => {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        {/* Mobile Menu Button - Fixed Position */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMobileSidebarToggle}
            className="fixed top-4 left-4 z-30 bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-md hover:bg-white transition-colors"
          >
            {isMobileSidebarOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        )}

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