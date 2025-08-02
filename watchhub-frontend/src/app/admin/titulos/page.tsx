'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
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
  Tag
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';

interface Titulo {
  id: string;
  nombre: string;
  categoria: string;
  edad_minima: number;
  tipo: 'pelicula' | 'serie' | 'documental';
  descripcion: string;
  url_video: string;
  imagen_portada: string;
  visible: boolean;
  fecha_creacion: string;
}

export default function AdminTitulos() {
  const router = useRouter();
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVisible, setFilterVisible] = useState<string>('all');
  const [selectedTitulo, setSelectedTitulo] = useState<Titulo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTitulos();
  }, []);

  const loadTitulos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setTitulos(data || []);
    } catch (error) {
      console.error('Error loading titles:', error);
      setError('Error al cargar los títulos');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error toggling visibility:', error);
      setError('Error al cambiar la visibilidad del título');
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

  const filteredTitulos = titulos.filter(titulo => {
    const matchesSearch = titulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         titulo.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         titulo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || titulo.tipo === filterType;
    const matchesVisible = filterVisible === 'all' || 
                          (filterVisible === 'visible' && titulo.visible) ||
                          (filterVisible === 'hidden' && !titulo.visible);

    return matchesSearch && matchesType && matchesVisible;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pelicula': return 'bg-blue-100 text-blue-800';
      case 'serie': return 'bg-green-100 text-green-800';
      case 'documental': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'pelicula': return 'Película';
      case 'serie': return 'Serie';
      case 'documental': return 'Documental';
      default: return type;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Títulos" description="Administrar contenido de la plataforma">
        <div className="animate-pulse">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
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
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Header y controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <Film className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestión de Contenido</h2>
              <p className="text-sm text-gray-600">
                {filteredTitulos.length} de {titulos.length} títulos
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push('/admin/titulos/nuevo')}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Título</span>
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
              className="pl-10"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="pelicula">Películas</option>
            <option value="serie">Series</option>
            <option value="documental">Documentales</option>
          </select>
          
          <select
            value={filterVisible}
            onChange={(e) => setFilterVisible(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">Todos los estados</option>
            <option value="visible">Publicados</option>
            <option value="hidden">Borradores</option>
          </select>
        </div>
      </div>

      {/* Grid de títulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTitulos.map((titulo) => (
          <div key={titulo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen */}
            <div className="aspect-video bg-gray-200 relative">
              {titulo.imagen_portada ? (
                <img
                  src={titulo.imagen_portada}
                  alt={titulo.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Estado de visibilidad */}
              <div className="absolute top-2 right-2">
                {titulo.visible ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Eye className="w-3 h-3 mr-1" />
                    Público
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Borrador
                  </span>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate flex-1">
                  {titulo.nombre}
                </h3>
                <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(titulo.tipo)}`}>
                  {getTypeName(titulo.tipo)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {titulo.descripcion}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {titulo.categoria}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(titulo.fecha_creacion)}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(titulo)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {titulo.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/titulos/${titulo.id}/editar`)}
                    className="text-green-600 hover:text-green-700"
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
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <span className="text-xs text-gray-500">
                  +{titulo.edad_minima}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredTitulos.length === 0 && (
        <div className="text-center py-12">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron títulos
          </h3>
          <p className="text-gray-600 mb-4">
            {titulos.length === 0 
              ? 'Comienza agregando tu primer título a la plataforma.'
              : 'Intenta ajustar tus filtros de búsqueda.'
            }
          </p>
          {titulos.length === 0 && (
            <Button onClick={() => router.push('/admin/titulos/nuevo')}>
              Agregar Primer Título
            </Button>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTitulo(null);
        }}
        title="Eliminar Título"
      >
        {selectedTitulo && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                ¿Estás seguro de que quieres eliminar este título? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Título a eliminar:</p>
              <p className="font-medium">{selectedTitulo.nombre}</p>
              <p className="text-sm text-gray-500">{selectedTitulo.categoria}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTitulo(null);
                }}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={deleteTitulo}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
