'use client';

import { useState } from 'react';
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

  const handleInputChange = (field: keyof TituloForm, value: string | number | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File, type: 'video' | 'image') => {
    try {
      setUploading(true);
      setError('');

      // Validar tamaño del archivo
      const maxSize = type === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`El archivo es demasiado grande. Máximo ${type === 'video' ? '500MB' : '10MB'}`);
      }

      // Validar tipo de archivo
      const allowedTypes = type === 'video' 
        ? ['video/mp4', 'video/webm', 'video/quicktime']
        : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido. Usa: ${allowedTypes.join(', ')}`);
      }

      // Mostrar advertencia para archivos grandes
      if (type === 'image' && file.size > 5 * 1024 * 1024) {
        console.warn('⚠️ Archivo grande detectado:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      }

      // Generar nombre único
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      // Upload optimizado según tamaño
      const uploadOptions = {
        cacheControl: '3600',
        upsert: false,
        ...(file.size > 2 * 1024 * 1024 && { duplex: 'half' })
      };

      const { data: uploadData, error: uploadError } = await supabase.storage
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

    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      setError(error.message || `Error al subir ${type === 'video' ? 'video' : 'imagen'}`);
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

  const testSupabaseConnection = async () => {
    try {
      console.log('🔍 === DIAGNÓSTICO COMPLETO DE SUPABASE STORAGE ===');
      
      // 1. Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 Usuario:', user?.email || 'No autenticado', authError);
      
      // 2. Verificar configuración del cliente
      console.log('🔧 Configuración del cliente:');
      console.log('- URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('- Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
      
      // 3. Test de conectividad básica
      console.log('🌐 Test de conectividad:');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
          }
        });
        console.log('- API REST status:', response.status, response.statusText);
      } catch (e) {
        console.error('- API REST error:', e);
      }
      
      // 4. Verificar buckets
      console.log('📦 Test de buckets:');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('- Buckets result:', buckets, bucketsError);
      
      // 5. Test directo al bucket content
      console.log('🎬 Test bucket content:');
      const { data: files, error: filesError } = await supabase.storage
        .from('content')
        .list('', { limit: 1 });
      console.log('- Files result:', files, filesError);
      
      // 6. Test de URLs públicas
      console.log('🔗 Test URL pública:');
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl('test.txt');
      console.log('- Public URL:', publicUrl);
      
      // 7. Test de upload pequeño
      console.log('� Test upload pequeño:');
      try {
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content')
          .upload(`test/test-${Date.now()}.txt`, testFile, {
            cacheControl: '3600',
            upsert: true
          });
        console.log('- Upload result:', uploadData, uploadError);
        
        // Si el upload funcionó, eliminar el archivo de prueba
        if (uploadData && !uploadError) {
          await supabase.storage.from('content').remove([uploadData.path]);
          console.log('- Test file cleaned up');
        }
      } catch (e) {
        console.error('- Upload test error:', e);
      }
      
      // 8. Verificar políticas RLS
      console.log('� Test políticas:');
      try {
        const { data: policies } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'objects');
        console.log('- Storage policies:', policies);
      } catch (e) {
        console.log('- No se pueden leer políticas (normal)');
      }
      
      console.log('🏁 === FIN DEL DIAGNÓSTICO ===');
      
    } catch (error) {
      console.error('❌ Error general en diagnóstico:', error);
    }
  };

  // Diagnóstico manual disponible si se necesita
  // useEffect(() => {
  //   testSupabaseConnection();
  // }, []);

  const categorias = [
    'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción',
    'Fantasy', 'Romance', 'Thriller', 'Documentales', 'Animación', 'Musical'
  ];

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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre del título *
                  </label>
                  <Input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Spider-Man: No Way Home"
                    className="text-lg font-medium h-12"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipo de contenido
                  </label>
                  <select
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Categoría *
                  </label>
                  <select
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Edad mínima
                  </label>
                  <Input
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Descripción *
                  </label>
                  <textarea
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
                  <label className="block text-sm font-semibold text-gray-700">
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
                  <label className="block text-sm font-semibold text-gray-700">
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔗 URL de video (alternativa)
                </label>
                <Input
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
                {loading ? 'Guardando...' : uploading ? 'Subiendo archivos...' : 'Guardar Título'}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
