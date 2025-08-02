'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getUserStats, getContentStats } from '@/lib/admin';
import { 
  Users, 
  Film, 
  Eye, 
  TrendingUp,
  UserCheck,
  Crown,
  Calendar,
  Activity
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
  totalTitles: number;
  visibleTitles: number;
  hiddenTitles: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [userStats, contentStats] = await Promise.all([
        getUserStats(),
        getContentStats()
      ]);

      setStats({
        ...userStats,
        ...contentStats
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" description="Vista general del sistema">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Usuarios registrados'
    },
    {
      title: 'Administradores',
      value: stats?.adminUsers || 0,
      icon: Crown,
      color: 'bg-purple-500',
      description: 'Usuarios con rol admin'
    },
    {
      title: 'Total Títulos',
      value: stats?.totalTitles || 0,
      icon: Film,
      color: 'bg-green-500',
      description: 'Contenido en la plataforma'
    },
    {
      title: 'Títulos Visibles',
      value: stats?.visibleTitles || 0,
      icon: Eye,
      color: 'bg-yellow-500',
      description: 'Contenido público'
    }
  ];

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Ver y editar usuarios del sistema',
      href: '/admin/usuarios',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Agregar Título',
      description: 'Subir nuevo contenido',
      href: '/admin/titulos/nuevo',
      icon: Film,
      color: 'bg-green-500'
    },
    {
      title: 'Subir Archivos',
      description: 'Gestionar videos y trailers',
      href: '/admin/upload',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Ver Estadísticas',
      description: 'Analytics detallados',
      href: '/admin/estadisticas',
      icon: Activity,
      color: 'bg-red-500'
    }
  ];

  return (
    <AdminLayout 
      title="Dashboard" 
      description="Vista general del sistema WatchHub"
    >
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <a
                key={index}
                href={action.href}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {stats?.recentUsers || 0} nuevos usuarios esta semana
                </p>
                <p className="text-xs text-gray-500">Últimos 7 días</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Film className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {stats?.visibleTitles} títulos publicados
                </p>
                <p className="text-xs text-gray-500">Contenido disponible</p>
              </div>
            </div>
            {stats?.hiddenTitles ? (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.hiddenTitles} títulos en borrador
                  </p>
                  <p className="text-xs text-gray-500">Pendientes de publicación</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de Datos</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Operativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Almacenamiento</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Disponible
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Supabase</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Conectado
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
