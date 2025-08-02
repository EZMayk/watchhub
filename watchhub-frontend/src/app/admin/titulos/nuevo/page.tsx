'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
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

  const handleInputChange = (field: keyof TituloForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File, type: 'video' | 'image') => {
    try {
      setUploading(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      if (type === 'video') {
        handleInputChange('url_video', publicUrl);
      } else {
        handleInputChange('imagen_portada', publicUrl);
      }

    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setError(`Error al subir ${type === 'video' ? 'video' : 'imagen'}`);
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
    } catch (error) {
      console.error('Error creating title:', error);
      setError('Error al crear el título');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [
    'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción',
    'Fantasy', 'Romance', 'Thriller', 'Documentales', 'Animación', 'Musical'
  ];

  return (
    <AdminLayout 
      title="Agregar Nuevo Título" 
      description="Crear contenido para la plataforma"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Título</h1>
            <p className="text-gray-600">Agrega contenido a la plataforma</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del título *
                  </label>
                  <Input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Spider-Man: No Way Home"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de contenido
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="pelicula">Película</option>
                    <option value="serie">Serie</option>
                    <option value="documental">Documental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad mínima
                  </label>
                  <Input
                    type="number"
                    value={form.edad_minima}
                    onChange={(e) => handleInputChange('edad_minima', parseInt(e.target.value) || 0)}
                    min="0"
                    max="18"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Describe brevemente de qué trata el contenido..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Archivos multimedia */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Archivos Multimedia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imagen de portada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de portada
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {form.imagen_portada ? (
                      <div>
                        <img
                          src={form.imagen_portada}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange('imagen_portada', '')}
                        >
                          Cambiar imagen
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-4">
                          Sube una imagen de portada
                        </p>
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
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos: JPG, PNG, WebP. Tamaño recomendado: 1920x1080px
                  </p>
                </div>

                {/* Video/Trailer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video/Trailer
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {form.url_video ? (
                      <div>
                        <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                          <FileVideo className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Video subido exitosamente</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange('url_video', '')}
                        >
                          Cambiar video
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-4">
                          Sube el video principal o trailer
                        </p>
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
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Subiendo...' : 'Seleccionar video'}
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos: MP4, WebM, MOV. Tamaño máximo: 500MB
                  </p>
                </div>
              </div>

              {/* URL alternativa */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de video (alternativa)
                </label>
                <Input
                  type="url"
                  value={form.url_video}
                  onChange={(e) => handleInputChange('url_video', e.target.value)}
                  placeholder="https://ejemplo.com/video.mp4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes pegar una URL directa al video en lugar de subirlo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de publicación */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración de Publicación
              </h3>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="visible"
                  checked={form.visible}
                  onChange={(e) => handleInputChange('visible', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="visible" className="text-sm font-medium text-gray-700">
                  Publicar inmediatamente
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Si no está marcado, el título se guardará como borrador
              </p>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Título'}</span>
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
