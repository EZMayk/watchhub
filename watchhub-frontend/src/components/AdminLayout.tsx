'use client';

import { useState, createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminProtectedRoute from './AdminProtectedRoute';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly description?: string;
}

// Context para manejar el estado del sidebar
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function AdminLayout({ 
  children, 
  title = 'Panel de Administración',
  description 
}: AdminLayoutProps) {
  const { userAccount, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarContextValue = useMemo(() => ({
    isCollapsed,
    setIsCollapsed
  }), [isCollapsed, setIsCollapsed]);

  return (
    <AdminProtectedRoute>
      <SidebarContext.Provider value={sidebarContextValue}>
        <div className="min-h-screen bg-black text-white">
          {/* Sidebar fijo */}
          <AdminSidebar 
            userName={userAccount?.nombre || user?.email || 'Admin'}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          
          {/* Contenido principal con margen dinámico */}
          <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-0 md:ml-64'}`}>
            {/* Header estilo Netflix */}
            <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4 sticky top-0 z-30">
              <div className="max-w-7xl flex items-center justify-between">
                {/* Botón para mostrar sidebar en móvil */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="w-6 h-6 text-gray-300" />
                </button>
                
                <div className="flex-1 md:flex-none">
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  {description && (
                    <p className="mt-1 text-sm text-gray-400">{description}</p>
                  )}
                </div>

                {/* Info del usuario admin */}
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-300">
                    Bienvenido, {userAccount?.nombre || 'Admin'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                    Administrador
                  </span>
                </div>
              </div>
            </header>
            
            {/* Contenido */}
            <main className="p-6 bg-black min-h-screen">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarContext.Provider>
    </AdminProtectedRoute>
  );
}
