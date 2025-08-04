'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Film,
  Upload,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FolderOpen,
  Crown
} from 'lucide-react';

interface AdminSidebarProps {
  userName: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general'
  },
  {
    name: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
    description: 'Gestión de usuarios'
  },
  {
    name: 'Títulos',
    href: '/admin/titulos',
    icon: Film,
    description: 'Gestión de contenido'
  },
  {
    name: 'Subir Contenido',
    href: '/admin/upload',
    icon: Upload,
    description: 'Subir videos y trailers'
  },
  {
    name: 'Archivos',
    href: '/admin/archivos',
    icon: FolderOpen,
    description: 'Gestión de archivos'
  },
  {
    name: 'Estadísticas',
    href: '/admin/estadisticas',
    icon: BarChart3,
    description: 'Analytics y reportes'
  },
  {
    name: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings,
    description: 'Configuración del sistema'
  }
];

export default function AdminSidebar({ userName, isCollapsed, setIsCollapsed }: Readonly<AdminSidebarProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {!isCollapsed && (
        <button 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden border-none cursor-default"
          onClick={() => setIsCollapsed(true)}
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-gray-900 text-white transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        md:translate-x-0
      `}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Crown className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">WatchHub Admin</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Información del usuario */}
        <div className="p-4 border-b border-gray-700">
          {!isCollapsed ? (
            <div>
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Botón de cerrar sesión */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            className={`
              flex items-center space-x-3 p-3 w-full rounded-lg
              text-gray-300 hover:bg-gray-700 hover:text-white transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Cerrar Sesión' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </>
  );
}
