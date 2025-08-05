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
  FolderOpen
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
        fixed top-0 left-0 z-50 h-full bg-black border-r border-gray-800 text-white transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        md:translate-x-0
      `}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Film className="w-8 h-8 text-red-600" />
              <span className="text-xl font-bold">WatchHub</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Información del usuario */}
        <div className="p-4 border-b border-gray-800">
          {!isCollapsed ? (
            <div>
              <p className="text-sm font-medium truncate text-white">{userName}</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 p-3 rounded-md transition-colors
                  ${isActive 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Botón de cerrar sesión */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className={`
              flex items-center space-x-3 p-3 w-full rounded-md
              text-gray-300 hover:bg-gray-800 hover:text-white transition-colors
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
