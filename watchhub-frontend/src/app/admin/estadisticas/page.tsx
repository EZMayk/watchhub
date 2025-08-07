'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/exports';
import { getUserStats, getContentStats } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import {
  BarChart3,
  Users,
  Film,
  Eye,
  EyeOff,
  TrendingUp,
  Activity,
  Calendar,
  Crown,
  Database,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
  totalTitles: number;
  visibleTitles: number;
  hiddenTitles: number;
}

interface CategoryStats {
  categoria: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  tipo: string;
  descripcion: string;
  fecha: string;
  usuario?: string;
}

export default function AdminEstadisticas() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas básicas
      const [userStats, contentStats] = await Promise.all([
        getUserStats(),
        getContentStats()
      ]);

      setStats({
        ...userStats,
        ...contentStats
      });

      // Cargar estadísticas por categoría
      await loadCategoryStats();
      
      // Cargar actividad reciente
      await loadRecentActivity();

    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryStats = async () => {
    try {
      const { data: titles, error } = await supabase
        .from('titulos')
        .select('categoria')
        .eq('visible', true);

      if (error) throw error;

      // Contar por categoría
      const categoryCount = titles.reduce((acc: Record<string, number>, title) => {
        acc[title.categoria] = (acc[title.categoria] || 0) + 1;
        return acc;
      }, {});

      const total = titles.length;
      const categoryStatsData: CategoryStats[] = Object.entries(categoryCount)
        .map(([categoria, count]) => ({
          categoria,
          count,
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      setCategoryStats(categoryStatsData);
    } catch (error) {
      console.error('Error loading category stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Simular actividad reciente (en una implementación real, tendrías una tabla de auditoría)
      const mockActivity: RecentActivity[] = [
        {
          tipo: 'usuario',
          descripcion: 'Nuevo usuario registrado',
          fecha: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          usuario: 'sistema'
        },
        {
          tipo: 'contenido',
          descripcion: 'Título publicado',
          fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          usuario: 'admin'
        },
        {
          tipo: 'usuario',
          descripcion: 'Usuario promovido a administrador',
          fecha: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          usuario: 'admin'
        }
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'usuario': return Users;
      case 'contenido': return Film;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Estadísticas" description="Analytics y reportes del sistema">
        <div className="animate-pulse space-y-6">
          {/* Skeleton para estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
            ))}
          </div>
          
          {/* Skeleton para gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 h-64"></div>
            <div className="bg-gray-800 rounded-xl p-6 h-64"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Estadísticas" description="Analytics y reportes del sistema">
        <div className="text-center py-12">
          <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-6 max-w-md mx-auto">
            <Database className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar estadísticas</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={loadAllStats}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Estadísticas" description="Analytics y reportes del sistema">
      <div className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Usuarios</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-green-400 mt-1">
                    +{stats?.recentUsers || 0} esta semana
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Administradores</p>
                  <p className="text-3xl font-bold text-white">{stats?.adminUsers || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.regularUsers || 0} usuarios regulares
                  </p>
                </div>
                <Crown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Títulos</p>
                  <p className="text-3xl font-bold text-white">{stats?.totalTitles || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Contenido total</p>
                </div>
                <Film className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Títulos Públicos</p>
                  <p className="text-3xl font-bold text-white">{stats?.visibleTitles || 0}</p>
                  <p className="text-xs text-yellow-400 mt-1">
                    {stats?.hiddenTitles || 0} en borrador
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos y estadísticas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución por categorías */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Contenido por Categoría</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {categoryStats.map((cat, index) => (
                  <div key={cat.categoria} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-green-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-white font-medium">{cat.categoria}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">{cat.count}</span>
                      <Badge className="bg-gray-700 text-gray-300">
                        {cat.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.tipo);
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.tipo === 'usuario' ? 'bg-blue-600/20 text-blue-400' :
                        activity.tipo === 'contenido' ? 'bg-green-600/20 text-green-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">
                          {activity.descripcion}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-400">
                            {formatDate(activity.fecha)}
                          </span>
                          {activity.usuario && (
                            <span className="text-xs text-gray-500">
                              por {activity.usuario}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas adicionales */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Resumen del Sistema</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {stats ? Math.round((stats.visibleTitles / stats.totalTitles) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-400">Contenido Publicado</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {stats ? Math.round((stats.adminUsers / stats.totalUsers) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-400">Usuarios Admin</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {categoryStats.length}
                </p>
                <p className="text-sm text-gray-400">Categorías Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
