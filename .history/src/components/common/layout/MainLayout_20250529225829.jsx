import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { MenuIcon, XIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";

const MainLayout = ({ children, userType = 'store', pageTitle = "Dashboard" }) => {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ✅ CORREÇÃO: Permitir scroll vertical, bloquear apenas horizontal
  useEffect(() => {
    document.body.style.overflowX = 'hidden'; // Apenas overflow horizontal
    document.body.style.overflowY = 'auto'; // Permitir scroll vertical
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
   
    <div className="flex min-h-screen bg-zinc-50 w-full max-w-[100vw] box-border">
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

      {/* ✅ CORREÇÃO: Main Content Area com scroll natural */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen w-full transition-all duration-300 relative",
        isMobile 
          ? 'ml-0 w-full'
          : isCollapsed
            ? 'ml-16 w-[calc(100%-4rem)]'  // 4rem = 64px (w-16)
            : 'ml-64 w-[calc(100%-16rem)]' // 16rem = 256px (w-64)
      )}>
        {/* Mobile Menu Button - Fixed position */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMobileSidebarToggle}
            className="fixed top-4 left-4 z-30 bg-white shadow-md hover:bg-zinc-100 border"
          >
            {isMobileSidebarOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        )}

        {/* ✅ CORREÇÃO: Main Content com scroll automático */}
        <main className="flex-1 w-full p-4 sm:p-6 bg-zinc-50">
          <div className="mx-auto w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;