'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/exports';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  Film,
  Image,
  FileVideo,
  AlertCircle
} from 'lucide-react';
import { Button, Input, Card, CardContent } from '@/components/ui';

interface TituloForm {
  nombre: string;
  categoria: string;
  edad_minima: number;
  tipo: 'pelicula' | 'serie' | 'documental';
  descripcion: string;
  url_video: string;
  imagen_portada: string;
  visible: boolean;
}

export default function NuevoTitulo() {
  const router = useRouter();
  const [form, setForm] = useState<TituloForm>({
    nombre: '',
    categoria: '',
    edad_minima: 0,
    tipo: 'pelicula',
    descripcion: '',
    url_video: '',
    imagen_portada: '',
    visible: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: keyof TituloForm, value: string | number | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Constantes para validación de archivos
  const FILE_VALIDATION = {
    MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
    MAX_IMAGE_SIZE: 10 * 1024 * 1024,  // 10MB
    LARGE_FILE_WARNING_SIZE: 5 * 1024 * 1024, // 5MB
    DUPLEX_THRESHOLD_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } as const;

  const validateFileSize = (file: File, type: 'video' | 'image') => {
    const maxSize = type === 'video' ? FILE_VALIDATION.MAX_VIDEO_SIZE : FILE_VALIDATION.MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      throw new Error(`El archivo es demasiado grande. Máximo ${type === 'video' ? '500MB' : '10MB'}`);
    }
  };

  const validateFileType = (file: File, type: 'video' | 'image') => {
    const allowedTypes = type === 'video' ? FILE_VALIDATION.ALLOWED_VIDEO_TYPES : FILE_VALIDATION.ALLOWED_IMAGE_TYPES;
    if (!(allowedTypes as readonly string[]).includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido. Usa: ${allowedTypes.join(', ')}`);
    }
  };

  const warnLargeFile = (file: File, type: 'video' | 'image') => {
    if (type === 'image' && file.size > FILE_VALIDATION.LARGE_FILE_WARNING_SIZE) {
      console.warn('⚠️ Archivo grande detectado:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
  };

  const generateUniqueFileName = (originalName: string, type: 'video' | 'image') => {
    const fileExt = originalName.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    return `${type}s/${fileName}`;
  };

  const getUploadOptions = (fileSize: number) => ({
    cacheControl: '3600',
    upsert: false,
    ...(fileSize > FILE_VALIDATION.DUPLEX_THRESHOLD_SIZE && { duplex: 'half' })
  });

  const getErrorMessage = (error: unknown, type: 'video' | 'image') => {
    const fallbackMessage = `Error al subir ${type === 'video' ? 'video' : 'imagen'}`;
    return error instanceof Error ? error.message : fallbackMessage;
  };

  const handleFileUpload = async (file: File, type: 'video' | 'image') => {
    try {
      setUploading(true);
      setError('');

      // Validaciones
      validateFileSize(file, type);
      validateFileType(file, type);
      warnLargeFile(file, type);

      // Generar nombre único
      const filePath = generateUniqueFileName(file.name, type);

      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      // Upload optimizado según tamaño
      const uploadOptions = getUploadOptions(file.size);

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file, uploadOptions);

      if (uploadError) {
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      // Actualizar formulario
      if (type === 'video') {
        handleInputChange('url_video', publicUrl);
      } else {
        handleInputChange('imagen_portada', publicUrl);
      }

    } catch (error: unknown) {
      console.error(`Error uploading ${type}:`, error);
      setError(getErrorMessage(error, type));
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!form.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!form.categoria.trim()) {
      setError('La categoría es requerida');
      return false;
    }
    if (!form.descripcion.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const { error } = await supabase
        .from('titulos')
        .insert([form]);

      if (error) throw error;

      router.push('/admin/titulos');
    } catch (error: unknown) {
      console.error('Error creating title:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el título';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categorias = useMemo(() => [
    'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción',
    'Fantasy', 'Romance', 'Thriller', 'Documentales', 'Animación', 'Musical'
  ], []);

  const getButtonText = () => {
    if (loading) return 'Guardando...';
    if (uploading) return 'Subiendo archivos...';
    return 'Guardar Título';
  };

  return (
    <AdminLayout 
      title="Agregar Nuevo Título" 
      description="Crear contenido para la plataforma"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header mejorado */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Título</h1>
            <p className="text-gray-600">Agrega contenido a la plataforma WatchHub</p>
          </div>
        </div>

        {/* Error Alert mejorado */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica mejorada */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Film className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Información Básica
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label htmlFor="titulo-nombre" className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre del título *
                  </label>
                  <Input
                    id="titulo-nombre"
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Spider-Man: No Way Home"
                    className="text-lg font-medium h-12"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="titulo-tipo" className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipo de contenido
                  </label>
                  <select
                    id="titulo-tipo"
                    value={form.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                  >
                    <option value="pelicula">🎬 Película</option>
                    <option value="serie">📺 Serie</option>
                    <option value="documental">📖 Documental</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="titulo-categoria" className="block text-sm font-semibold text-gray-700 mb-3">
                    Categoría *
                  </label>
                  <select
                    id="titulo-categoria"
                    value={form.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="titulo-edad" className="block text-sm font-semibold text-gray-700 mb-3">
                    Edad mínima
                  </label>
                  <Input
                    id="titulo-edad"
                    type="number"
                    value={form.edad_minima}
                    onChange={(e) => handleInputChange('edad_minima', parseInt(e.target.value) || 0)}
                    min="0"
                    max="18"
                    placeholder="0"
                    className="h-12 font-medium"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="titulo-descripcion" className="block text-sm font-semibold text-gray-700 mb-3">
                    Descripción *
                  </label>
                  <textarea
                    id="titulo-descripcion"
                    value={form.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium resize-none"
                    placeholder="Describe brevemente de qué trata el contenido..."
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archivos multimedia */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Archivos Multimedia
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Imagen de portada */}
                <div className="space-y-4">
                  <label htmlFor="image-upload" className="block text-sm font-semibold text-gray-700">
                    📸 Imagen de portada
                  </label>
                  {form.imagen_portada ? (
                    <div className="relative group">
                      <img
                        src={form.imagen_portada}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange('imagen_portada', '')}
                          className="bg-white/90 text-gray-900 hover:bg-white"
                        >
                          Cambiar imagen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 transition-colors">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Sube una imagen de portada
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG, WebP hasta 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'image');
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          disabled={uploading}
                          className="flex items-center space-x-2"
                        >
                          {uploading ? (
                            <>
                              <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                              <span>Subiendo...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Seleccionar imagen</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video/Trailer */}
                <div className="space-y-4">
                  <label htmlFor="video-upload" className="block text-sm font-semibold text-gray-700">
                    🎬 Video/Trailer
                  </label>
                  {form.url_video ? (
                    <div className="relative group">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl shadow-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <FileVideo className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm font-medium">Video subido exitosamente</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange('url_video', '')}
                          className="bg-white/90 text-gray-900 hover:bg-white"
                        >
                          Cambiar video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 transition-colors">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Film className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Sube el video principal o trailer
                          </p>
                          <p className="text-xs text-gray-500">
                            MP4, WebM, MOV hasta 500MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'video');
                          }}
                          className="hidden"
                          id="video-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('video-upload')?.click()}
                          disabled={uploading}
                          className="flex items-center space-x-2"
                        >
                          {uploading ? (
                            <>
                              <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                              <span>Subiendo...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Seleccionar video</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* URL alternativa */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <label htmlFor="url-video" className="block text-sm font-semibold text-gray-700 mb-3">
                  🔗 URL de video (alternativa)
                </label>
                <Input
                  id="url-video"
                  type="url"
                  value={form.url_video}
                  onChange={(e) => handleInputChange('url_video', e.target.value)}
                  placeholder="https://ejemplo.com/video.mp4"
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Puedes pegar una URL directa al video en lugar de subirlo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de publicación */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Configuración de Publicación
                </h3>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="visible"
                  checked={form.visible}
                  onChange={(e) => handleInputChange('visible', e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div>
                  <label htmlFor="visible" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    🚀 Publicar inmediatamente
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Si no está marcado, el título se guardará como borrador
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción mejorados */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancelar</span>
            </Button>
            
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center space-x-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Save className="w-4 h-4" />
              <span>
                {getButtonText()}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
