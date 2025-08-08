'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/exports';
import { supabase } from '@/lib/supabase';
import { 
  Film, 
  Plus, 
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Play,
  Wifi,
  WifiOff,
  TrendingUp,
  Database,
  ExternalLink,
  Save,
  X
} from 'lucide-react';
import { Button, Input, Modal, Card, CardContent, Alert, Badge } from '@/components/ui';

interface Titulo {
  id: string;
  titulo: string;
  categoria: string;
  edad_minima: number;
  tipo: 'pelicula' | 'serie' | 'documental' | 'trailer';
  descripcion: string;
  año?: number;
  duracion?: string;
  director?: string;
  actores?: string;
  genero?: string;
  url_video: string;
  imagen_portada: string;
  visible: boolean;
  created_at?: string;
  updated_at?: string;
  fecha_creacion?: string;
}

interface TituloStats {
  total: number;
  visible: number;
  hidden: number;
  movies: number;
  series: number;
  documentaries: number;
  trailers: number;
}

interface FilterState {
  search: string;
  tipo: string;
  visible: string;
  categoria: string;
}

export default function AdminTitulos() {
  const router = useRouter();
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVisible, setFilterVisible] = useState<string>('all');
  const [selectedTitulo, setSelectedTitulo] = useState<Titulo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTitulo, setEditingTitulo] = useState<Titulo | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Funciones para manejar cambios en tiempo real
  const handleTituloInsert = useCallback((payload: any) => {
    setTitulos(prev => [payload.new as Titulo, ...prev]);
    setSuccess('¡Nuevo título agregado en tiempo real!');
    setTimeout(() => setSuccess(''), 3000);
  }, []);

  const handleTituloUpdate = useCallback((payload: any) => {
    setTitulos(prev => prev.map(titulo => 
      titulo.id === payload.new.id ? payload.new as Titulo : titulo
    ));
  }, []);

  const handleTituloDelete = useCallback((payload: any) => {
    setTitulos(prev => prev.filter(titulo => titulo.id !== payload.old.id));
  }, []);

  const handleRealtimeChanges = useCallback((payload: any) => {
    console.log('📡 Cambio detectado en títulos:', payload);
    
    // Actualizar la lista cuando hay cambios
    if (payload.eventType === 'INSERT') {
      handleTituloInsert(payload);
    } else if (payload.eventType === 'UPDATE') {
      handleTituloUpdate(payload);
    } else if (payload.eventType === 'DELETE') {
      handleTituloDelete(payload);
    }
  }, [handleTituloInsert, handleTituloUpdate, handleTituloDelete]);

  useEffect(() => {
    loadTitulos();
    
    // Configurar verificación de conectividad
    const checkConnection = setInterval(testConnection, 30000); // Cada 30 segundos
    
    // Configurar suscripción en tiempo real para cambios en títulos
    const subscription = supabase
      .channel('titulos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'titulos'
        },
        handleRealtimeChanges
      )
      .subscribe();

    return () => {
      clearInterval(checkConnection);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleRealtimeChanges]);

  // Verificar conectividad con Supabase
  const testConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      const { error } = await supabase
        .from('titulos')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('disconnected');
    }
  }, []);

  const loadTitulos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setConnectionStatus('checking');
      
      // Primero intentar con created_at, si falla, probar con fecha_creacion, o sin orden
      const query = supabase.from('titulos').select('*');
      
      try {
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error?.message?.includes('created_at')) {
          throw error;
        }
        setTitulos(data || []);
      } catch (orderError) {
        console.log('🔄 Reintentando sin ordenamiento específico...');
        console.warn('Error al ordenar por created_at:', orderError);
        
        const { data, error } = await supabase.from('titulos').select('*');
        
        if (error) {
          if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
            throw new Error('Sin conexión a internet o problemas con el servidor. Verifica tu conexión.');
          }
          throw error;
        }
        
        // Ordenar manualmente por id si no hay columnas de fecha
        const sortedData = (data || []).sort((a, b) => {
          if (a.id && b.id) {
            return b.id.localeCompare(a.id);
          }
          return 0;
        });
        
        setTitulos(sortedData);
      }
      
      setConnectionStatus('connected');
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading titles:', error);
      setConnectionStatus('disconnected');
      
      let errorMessage = 'Error al cargar los títulos';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await loadTitulos();
    setRefreshing(false);
  }, [loadTitulos]);

  const toggleVisibility = async (titulo: Titulo) => {
    try {
      const { error } = await supabase
        .from('titulos')
        .update({ visible: !titulo.visible })
        .eq('id', titulo.id);

      if (error) throw error;

      setTitulos(titulos.map(t => 
        t.id === titulo.id 
          ? { ...t, visible: !t.visible }
          : t
      ));

      setSuccess(`Título ${!titulo.visible ? 'publicado' : 'ocultado'} exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      setError('Error al cambiar la visibilidad del título');
      setTimeout(() => setError(''), 5000);
    }
  };

  const deleteTitulo = async () => {
    if (!selectedTitulo) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('titulos')
        .delete()
        .eq('id', selectedTitulo.id);

      if (error) throw error;

      setTitulos(titulos.filter(t => t.id !== selectedTitulo.id));
      setSuccess('Título eliminado exitosamente');
      setShowDeleteModal(false);
      setSelectedTitulo(null);
    } catch (error) {
      console.error('Error deleting title:', error);
      setError('Error al eliminar el título');
    } finally {
      setDeleting(false);
    }
  };

  const saveEditedTitulo = async () => {
    if (!editingTitulo) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('titulos')
        .update({
          titulo: editingTitulo.titulo,
          descripcion: editingTitulo.descripcion,
          tipo: editingTitulo.tipo,
          categoria: editingTitulo.categoria,
          año: editingTitulo.año,
          duracion: editingTitulo.duracion,
          director: editingTitulo.director,
          actores: editingTitulo.actores,
          genero: editingTitulo.genero,
          edad_minima: editingTitulo.edad_minima,
          visible: editingTitulo.visible
        })
        .eq('id', editingTitulo.id);

      if (error) throw error;

      // Actualizar la lista local
      setTitulos(titulos.map(t => 
        t.id === editingTitulo.id ? editingTitulo : t
      ));

      setSuccess('Título actualizado exitosamente');
      setShowEditModal(false);
      setEditingTitulo(null);
    } catch (error) {
      console.error('Error updating title:', error);
      setError('Error al actualizar el título');
    } finally {
      setSaving(false);
    }
  };

  const filteredTitulos = useMemo(() => {
    return titulos.filter(titulo => {
      const matchesSearch = titulo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           titulo.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           titulo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           titulo.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           titulo.actores?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           titulo.genero?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || titulo.tipo === filterType;
      const matchesVisible = filterVisible === 'all' || 
                            (filterVisible === 'visible' && titulo.visible) ||
                            (filterVisible === 'hidden' && !titulo.visible);

      return matchesSearch && matchesType && matchesVisible;
    });
  }, [titulos, searchTerm, filterType, filterVisible]);

  // Estadísticas calculadas
  const stats = useMemo((): TituloStats => {
    return {
      total: titulos.length,
      visible: titulos.filter(t => t.visible).length,
      hidden: titulos.filter(t => !t.visible).length,
      movies: titulos.filter(t => t.tipo === 'pelicula').length,
      series: titulos.filter(t => t.tipo === 'serie').length,
      documentaries: titulos.filter(t => t.tipo === 'documental').length,
      trailers: titulos.filter(t => t.tipo === 'trailer').length,
    };
  }, [titulos]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOriginalUrl = (url: string) => {
    if (!url) return url;
    
    // Si es una URL de embed, convertirla a URL normal
    if (url.includes('youtube.com/embed/')) {
      const videoId = url.split('embed/')[1]?.split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // Si ya es una URL normal, devolverla tal como está
    return url;
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return url;
    
    // Si ya es una URL de embed de YouTube, devolverla tal como está
    if (url.includes('youtube.com/embed/') || url.includes('youtu.be/embed/')) {
      return url;
    }
    
    // Convertir URL normal de YouTube a embed
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Convertir URL corta de YouTube a embed
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Para otras URLs (como archivos de video directo), devolverlas tal como están
    return url;
  };

  const getCreatedDate = (titulo: Titulo) => {
    return titulo.created_at || titulo.updated_at || titulo.fecha_creacion || '';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pelicula': return 'bg-blue-600 text-white';
      case 'serie': return 'bg-green-600 text-white';
      case 'documental': return 'bg-purple-600 text-white';
      case 'trailer': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'pelicula': return 'Película';
      case 'serie': return 'Serie';
      case 'documental': return 'Documental';
      case 'trailer': return 'Trailer';
      default: return type;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Títulos" description="Administrar contenido de la plataforma">
        <div className="animate-pulse">
          {/* Skeleton para estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
          
          {/* Skeleton para controles */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </div>
          </div>
          
          {/* Skeleton para grid de títulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`loading-title-${i}`} className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="aspect-video bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gestión de Títulos" 
      description={`${titulos.length} títulos en el sistema`}
    >
      {/* Indicador de conectividad */}
      <div className="mb-4">
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' && (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-400">Conectado</span>
              </>
            )}
            {connectionStatus === 'disconnected' && (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-400">Desconectado</span>
              </>
            )}
            {connectionStatus === 'checking' && (
              <>
                <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                <span className="text-sm text-yellow-400">Verificando...</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Última actualización: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="text-gray-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total de Títulos</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Publicados</p>
                <p className="text-2xl font-bold text-green-400">{stats.visible}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Borradores</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.hidden}</p>
              </div>
              <EyeOff className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Más Popular</p>
                <p className="text-lg font-semibold text-white">
                  {(() => {
                    const max = Math.max(stats.movies, stats.series, stats.documentaries, stats.trailers);
                    if (max === stats.movies) return 'Películas';
                    if (max === stats.series) return 'Series';
                    if (max === stats.documentaries) return 'Documentales';
                    if (max === stats.trailers) return 'Trailers';
                    return 'N/A';
                  })()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <div>
            <h4 className="font-semibold">Error de conexión</h4>
            <p>{error}</p>
          </div>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-6">
          <CheckCircle className="w-4 h-4" />
          <div>
            <h4 className="font-semibold">Operación exitosa</h4>
            <p>{success}</p>
          </div>
        </Alert>
      )}

      {/* Header y controles */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <Film className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Gestión de Contenido</h2>
              <p className="text-sm text-gray-400">
                {filteredTitulos.length} de {titulos.length} títulos
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push('/admin/upload')}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Contenido</span>
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar títulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="pelicula">Películas</option>
            <option value="serie">Series</option>
            <option value="documental">Documentales</option>
            <option value="trailer">Trailers</option>
          </select>
          
          <select
            value={filterVisible}
            onChange={(e) => setFilterVisible(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Todos los estados</option>
            <option value="visible">Publicados</option>
            <option value="hidden">Borradores</option>
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterVisible('all');
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Grid de títulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTitulos.map((titulo) => (
          <div key={titulo.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-red-500/50 transition-all duration-300 group">
            {/* Imagen */}
            <div className="aspect-video bg-gray-700 relative overflow-hidden">
              {titulo.imagen_portada ? (
                <img
                  src={titulo.imagen_portada}
                  alt={titulo.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              <div className={`w-full h-full flex items-center justify-center ${titulo.imagen_portada ? 'hidden' : ''}`}>
                <Film className="w-12 h-12 text-gray-500" />
              </div>
              
              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex space-x-2">
                  {titulo.url_video && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTitulo(titulo);
                        setShowPreviewModal(true);
                      }}
                      className="bg-black/50 hover:bg-black/70 text-white"
                      title="Vista previa"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTitulo({ ...titulo });
                      setShowEditModal(true);
                    }}
                    className="bg-black/50 hover:bg-black/70 text-white"
                    title="Edición rápida"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Estado de visibilidad */}
              <div className="absolute top-3 right-3">
                {titulo.visible ? (
                  <Badge className="bg-green-600 text-white">
                    <Eye className="w-3 h-3 mr-1" />
                    Público
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-600 text-white">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Borrador
                  </Badge>
                )}
              </div>
              
              {/* Tipo de contenido */}
              <div className="absolute top-3 left-3">
                <Badge className={getTypeColor(titulo.tipo)}>
                  {getTypeName(titulo.tipo)}
                </Badge>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white truncate flex-1 group-hover:text-red-400 transition-colors">
                  {titulo.titulo}
                </h3>
                <span className="ml-2 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                  +{titulo.edad_minima}
                </span>
              </div>
              
              <p className="text-sm text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                {titulo.descripcion}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  <span className="truncate">{titulo.categoria}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {titulo.año && (
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                      {titulo.año}
                    </span>
                  )}
                  {titulo.duracion && (
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                      {titulo.duracion}
                    </span>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(getCreatedDate(titulo))}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(titulo)}
                    className={`${titulo.visible ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                    title={titulo.visible ? 'Ocultar título' : 'Publicar título'}
                  >
                    {titulo.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTitulo({ ...titulo });
                      setShowEditModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                    title="Editar título"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTitulo(titulo);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-400 hover:text-red-300"
                    title="Eliminar título"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {titulo.url_video && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getOriginalUrl(titulo.url_video), '_blank')}
                    className="text-gray-400 hover:text-white"
                    title="Ver en nueva pestaña"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredTitulos.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="bg-gray-800 rounded-xl p-12 max-w-md mx-auto">
            <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {titulos.length === 0 ? 'No hay títulos' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-400 mb-6">
              {titulos.length === 0 
                ? 'Comienza agregando tu primer título a la plataforma.'
                : 'Intenta ajustar tus filtros de búsqueda.'
              }
            </p>
            {titulos.length === 0 ? (
              <Button 
                onClick={() => router.push('/admin/upload')}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Subir Primer Contenido
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterVisible('all');
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modal de vista previa */}
      {showPreviewModal && selectedTitulo && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedTitulo(null);
          }}
          title={`Vista previa: ${selectedTitulo.titulo}`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {selectedTitulo.url_video ? (
                <iframe
                  src={getEmbedUrl(selectedTitulo.url_video)}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Preview de ${selectedTitulo.titulo}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No hay video disponible</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Categoría:</span>
                <p className="text-white font-medium">{selectedTitulo.categoria}</p>
              </div>
              <div>
                <span className="text-gray-400">Tipo:</span>
                <p className="text-white font-medium">{getTypeName(selectedTitulo.tipo)}</p>
              </div>
              <div>
                <span className="text-gray-400">Edad mínima:</span>
                <p className="text-white font-medium">+{selectedTitulo.edad_minima}</p>
              </div>
              <div>
                <span className="text-gray-400">Estado:</span>
                <p className={`font-medium ${selectedTitulo.visible ? 'text-green-400' : 'text-yellow-400'}`}>
                  {selectedTitulo.visible ? 'Publicado' : 'Borrador'}
                </p>
              </div>
              {selectedTitulo.año && (
                <div>
                  <span className="text-gray-400">Año:</span>
                  <p className="text-white font-medium">{selectedTitulo.año}</p>
                </div>
              )}
              {selectedTitulo.duracion && (
                <div>
                  <span className="text-gray-400">Duración:</span>
                  <p className="text-white font-medium">{selectedTitulo.duracion}</p>
                </div>
              )}
              {selectedTitulo.director && (
                <div>
                  <span className="text-gray-400">Director:</span>
                  <p className="text-white font-medium">{selectedTitulo.director}</p>
                </div>
              )}
              {selectedTitulo.genero && (
                <div>
                  <span className="text-gray-400">Género:</span>
                  <p className="text-white font-medium">{selectedTitulo.genero}</p>
                </div>
              )}
            </div>
            
            {selectedTitulo.actores && (
              <div>
                <span className="text-gray-400 text-sm">Actores:</span>
                <p className="text-white mt-1">{selectedTitulo.actores}</p>
              </div>
            )}
            
            <div>
              <span className="text-gray-400 text-sm">Descripción:</span>
              <p className="text-white mt-1">{selectedTitulo.descripcion}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedTitulo(null);
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setShowPreviewModal(false);
                  router.push(`/admin/titulos/${selectedTitulo.id}/editar`);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de edición rápida */}
      {showEditModal && editingTitulo && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTitulo(null);
          }}
          title={`Editar: ${editingTitulo.titulo}`}
          size="xl"
        >
          <div className="flex flex-col h-full">
            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-titulo" className="block text-sm font-medium text-gray-300 mb-2">
                        Título *
                      </label>
                      <Input
                        id="edit-titulo"
                        value={editingTitulo.titulo}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          titulo: e.target.value
                        })}
                        placeholder="Nombre del título"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-tipo" className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo
                      </label>
                      <select
                        id="edit-tipo"
                        value={editingTitulo.tipo}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          tipo: e.target.value as 'pelicula' | 'serie' | 'documental' | 'trailer'
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="pelicula">Película</option>
                        <option value="serie">Serie</option>
                        <option value="documental">Documental</option>
                        <option value="trailer">Trailer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-categoria" className="block text-sm font-medium text-gray-300 mb-2">
                        Categoría
                      </label>
                      <Input
                        id="edit-categoria"
                        value={editingTitulo.categoria}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          categoria: e.target.value
                        })}
                        placeholder="Ej: Acción, Drama, Comedia"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-año" className="block text-sm font-medium text-gray-300 mb-2">
                          Año
                        </label>
                        <Input
                          id="edit-año"
                          type="number"
                          value={editingTitulo.año || ''}
                          onChange={(e) => setEditingTitulo({
                            ...editingTitulo,
                            año: parseInt(e.target.value) || undefined
                          })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-edad-minima" className="block text-sm font-medium text-gray-300 mb-2">
                          Edad Mínima
                        </label>
                        <Input
                          id="edit-edad-minima"
                          type="number"
                          min="0"
                          max="18"
                          value={editingTitulo.edad_minima}
                          onChange={(e) => setEditingTitulo({
                            ...editingTitulo,
                            edad_minima: parseInt(e.target.value) || 0
                          })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-visible"
                        checked={editingTitulo.visible}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          visible: e.target.checked
                        })}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <label htmlFor="edit-visible" className="text-sm text-gray-300">
                        Visible para los usuarios
                      </label>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-descripcion" className="block text-sm font-medium text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        id="edit-descripcion"
                        value={editingTitulo.descripcion}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          descripcion: e.target.value
                        })}
                        placeholder="Descripción del contenido..."
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-director" className="block text-sm font-medium text-gray-300 mb-2">
                        Director
                      </label>
                      <Input
                        id="edit-director"
                        value={editingTitulo.director || ''}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          director: e.target.value
                        })}
                        placeholder="Nombre del director"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-duracion" className="block text-sm font-medium text-gray-300 mb-2">
                        Duración
                      </label>
                      <Input
                        id="edit-duracion"
                        value={editingTitulo.duracion || ''}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          duracion: e.target.value
                        })}
                        placeholder="Ej: 120 min"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-genero" className="block text-sm font-medium text-gray-300 mb-2">
                        Género
                      </label>
                      <Input
                        id="edit-genero"
                        value={editingTitulo.genero || ''}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          genero: e.target.value
                        })}
                        placeholder="Ej: Acción, Suspenso"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-actores" className="block text-sm font-medium text-gray-300 mb-2">
                        Actores
                      </label>
                      <Input
                        id="edit-actores"
                        value={editingTitulo.actores || ''}
                        onChange={(e) => setEditingTitulo({
                          ...editingTitulo,
                          actores: e.target.value
                        })}
                        placeholder="Actores principales (separados por comas)"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones fijos en la parte inferior */}
            <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTitulo(null);
                  }}
                  disabled={saving}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button
                  onClick={saveEditedTitulo}
                  disabled={saving || !editingTitulo.titulo.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 shadow-lg w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTitulo(null);
        }}
        title="Eliminar Título"
        size="md"
      >
        {selectedTitulo && (
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-semibold mb-1">¡Advertencia!</h4>
                <p className="text-sm text-red-300">
                  Esta acción no se puede deshacer. El título será eliminado permanentemente de la plataforma.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-start space-x-4">
                {selectedTitulo.imagen_portada ? (
                  <img
                    src={selectedTitulo.imagen_portada}
                    alt={selectedTitulo.titulo}
                    className="w-20 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
                    <Film className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{selectedTitulo.titulo}</h4>
                  <p className="text-gray-400 text-sm">{selectedTitulo.categoria}</p>
                  {selectedTitulo.director && (
                    <p className="text-gray-500 text-xs">Dir: {selectedTitulo.director}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getTypeColor(selectedTitulo.tipo)}>
                      {getTypeName(selectedTitulo.tipo)}
                    </Badge>
                    <span className="text-xs text-gray-500">+{selectedTitulo.edad_minima}</span>
                    {selectedTitulo.año && (
                      <span className="text-xs text-gray-500">{selectedTitulo.año}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTitulo(null);
                }}
                disabled={deleting}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={deleteTitulo}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Título
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
    </AdminLayout>
  );
}
