'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { 
  Upload, 
  Film, 
  Image as ImageIcon, 
  FileVideo,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { Button, Input, Alert, Card, CardContent } from '@/components/ui';

interface UploadFile {
  id: string;
  file: File;
  type: 'video' | 'image';
  progress: number;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface TituloForm {
  titulo: string;
  descripcion: string;
  tipo: 'pelicula' | 'serie' | 'documental' | 'trailer';
  categoria: string;
  año: number;
  duracion: string;
  duracion_segundos: number | null;
  director: string;
  actores: string;
  genero: string;
  edad_minima: number;
  url_video: string;
  imagen_portada: string;
  visible: boolean;
}

const defaultTitulo: TituloForm = {
  titulo: '',
  descripcion: '',
  tipo: 'pelicula',
  categoria: '',
  año: new Date().getFullYear(),
  duracion: '',
  duracion_segundos: null,
  director: '',
  actores: '',
  genero: '',
  edad_minima: 0,
  url_video: '',
  imagen_portada: '',
  visible: true
};

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'titles'>('files');
  const [tituloForm, setTituloForm] = useState<TituloForm>(defaultTitulo);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [uploadedTitles, setUploadedTitles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Cargar archivos existentes del Storage al montar el componente
  useEffect(() => {
    loadExistingFiles();
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      console.log('🔍 Verificando conexión a la base de datos...');
      
      // 1. Verificar la configuración de Supabase
      console.log('🔧 Configuración de Supabase:');
      console.log('📍 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'NO CONFIGURADA');
      console.log('🔑 API Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'NO CONFIGURADA');
      
      // 2. Verificar si la tabla existe y su estructura
      console.log('📋 Verificando estructura de la tabla...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('titulos')
        .select('*')
        .limit(1);

      if (tableError) {
        console.error('❌ Error accediendo a la tabla:', tableError);
        alert(`❌ Error accediendo a la tabla: ${tableError.message}`);
        return;
      }

      console.log('✅ Tabla accesible:', tableInfo);
      
      // 3. Verificar permisos con una inserción de prueba
      console.log('🧪 Probando inserción de prueba...');
      const testData = {
        titulo: 'TEST_TITULO_' + Date.now(),
        descripcion: 'Prueba de conexión',
        tipo: 'pelicula' as const,
        categoria: 'Prueba',
        año: 2025,
        duracion: '90 min',
        director: 'Director Prueba',
        actores: 'Actor Prueba',
        genero: 'Prueba',
        edad_minima: 0,
        url_video: '',
        imagen_portada: '',
        visible: false
      };

      const { data: insertData, error: insertError } = await supabase
        .from('titulos')
        .insert([testData])
        .select();

      if (insertError) {
        console.error('❌ Error en inserción de prueba:', insertError);
        console.error('❌ Código:', insertError.code);
        console.error('❌ Detalles:', insertError.details);
        console.error('❌ Hint:', insertError.hint);
        alert(`❌ Error en inserción de prueba: ${insertError.message}`);
        return;
      }

      console.log('✅ Inserción de prueba exitosa:', insertData);
      
      // 4. Limpiar datos de prueba
      if (insertData && insertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('titulos')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.warn('⚠️ No se pudo eliminar el registro de prueba:', deleteError);
        } else {
          console.log('🧹 Registro de prueba eliminado correctamente');
        }
      }

    } catch (error) {
      console.error('❌ Error verificando la base de datos:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const testCurrentFormData = async () => {
    try {
      console.log('🧪 Probando inserción con los datos actuales del formulario...');
      console.log('📋 Datos del formulario:', tituloForm);

      // Preparar exactamente los mismos datos que se enviarían
      const dataToInsert = {
        titulo: tituloForm.titulo.trim(),
        descripcion: tituloForm.descripcion.trim() || null,
        tipo: tituloForm.tipo,
        categoria: tituloForm.categoria.trim() || null,
        año: tituloForm.año,
        duracion: tituloForm.duracion.trim() || null,
        director: tituloForm.director.trim() || null,
        actores: tituloForm.actores.trim() || null,
        genero: tituloForm.genero.trim() || null,
        edad_minima: tituloForm.edad_minima,
        url_video: tituloForm.url_video.trim() || null,
        imagen_portada: tituloForm.imagen_portada.trim() || null,
        visible: false // Usar false para que sea fácil de identificar y eliminar
      };

      console.log('📤 Datos preparados para prueba:', dataToInsert);

      // Validación básica
      if (!dataToInsert.titulo) {
        alert('⚠️ Necesitas completar al menos el título para probar');
        return;
      }

      // Insertar con timeout de 10 segundos para prueba rápida
      console.log('⏱️ Iniciando inserción de prueba (timeout 10 segundos)...');

      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de prueba: 10 segundos')), 10000)
      );

      const insertPromise = supabase
        .from('titulos')
        .insert([dataToInsert])
        .select();

      const result = await Promise.race([insertPromise, timeout]);
      const { data, error } = result as any;

      console.log('✅ Resultado de la prueba:', { data, error });

      if (error) {
        console.error('❌ Error en la prueba:', error);
        alert(`❌ Error en la prueba: ${error.message}\n\nRevisa la consola para más detalles.`);
        return;
      }

      if (data && data.length > 0) {
        console.log('✅ Prueba exitosa! Eliminando registro de prueba...');
        
        // Eliminar el registro de prueba
        const { error: deleteError } = await supabase
          .from('titulos')
          .delete()
          .eq('id', data[0].id);

        if (deleteError) {
          console.warn('⚠️ No se pudo eliminar el registro de prueba:', deleteError);
          alert(`✅ Prueba exitosa! PERO no se pudo eliminar el registro de prueba. Elimínalo manualmente: ID ${data[0].id}`);
        } else {
          console.log('🧹 Registro de prueba eliminado');
          alert('✅ ¡Prueba completamente exitosa! Los datos se pueden guardar correctamente.\n\n¿Por qué falló antes? Podría ser un problema temporal de red o timeout.');
        }
      } else {
        alert('⚠️ Prueba parcial: No se devolvieron datos, pero tampoco hubo error');
      }

    } catch (error) {
      console.error('❌ Error completo en la prueba:', error);
      
      let errorMsg = 'Error desconocido';
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      alert(`❌ Error en la prueba: ${errorMsg}\n\nRevisa la consola para más detalles.`);
    }
  };

  const loadExistingFiles = async () => {
    try {
      setIsLoadingFiles(true);
      console.log('🔄 Cargando archivos existentes del Storage...');

      // Primero verificar si el bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('📦 Buckets disponibles:', buckets);
      if (bucketsError) {
        console.error('❌ Error listando buckets:', bucketsError);
      }

      // Obtener archivos de videos
      console.log('🎬 Intentando listar archivos de videos...');
      const { data: videoFiles, error: videoError } = await supabase.storage
        .from('media')
        .list('videos', {
          limit: 100,
          offset: 0
        });

      console.log('🎬 Archivos de video encontrados:', videoFiles);
      if (videoError) {
        console.error('❌ Error cargando videos:', videoError);
      }

      // Obtener archivos de imágenes
      console.log('🖼️ Intentando listar archivos de imágenes...');
      const { data: imageFiles, error: imageError } = await supabase.storage
        .from('media')
        .list('posters', {
          limit: 100,
          offset: 0
        });

      console.log('🖼️ Archivos de imagen encontrados:', imageFiles);
      if (imageError) {
        console.error('❌ Error cargando imágenes:', imageError);
      }

      // NUEVO: Buscar también en la raíz del bucket
      console.log('📁 Intentando listar archivos en la raíz del bucket...');
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('media')
        .list('', {
          limit: 100,
          offset: 0
        });

      console.log('📁 Archivos en la raíz encontrados:', rootFiles);
      if (rootError) {
        console.error('❌ Error cargando archivos de la raíz:', rootError);
      }

      const existingFiles: UploadFile[] = [];

      // Procesar videos
      if (videoFiles && videoFiles.length > 0) {
        console.log(`📁 Procesando ${videoFiles.length} archivos de video...`);
        videoFiles.forEach(file => {
          console.log('🎬 Procesando video:', file);
          if (file.name && !file.name.includes('.emptyFolderPlaceholder')) {
            const { data: { publicUrl } } = supabase.storage
              .from('media')
              .getPublicUrl(`videos/${file.name}`);

            console.log('🔗 URL generada para video:', publicUrl);

            existingFiles.push({
              id: `existing-video-${file.name}`,
              file: new File([], file.name), // File placeholder
              type: 'video',
              progress: 100,
              status: 'success',
              url: publicUrl
            });
          }
        });
      } else {
        console.log('📁 No se encontraron archivos de video');
      }

      // Procesar imágenes
      if (imageFiles && imageFiles.length > 0) {
        console.log(`📁 Procesando ${imageFiles.length} archivos de imagen...`);
        imageFiles.forEach(file => {
          console.log('🖼️ Procesando imagen:', file);
          if (file.name && !file.name.includes('.emptyFolderPlaceholder')) {
            const { data: { publicUrl } } = supabase.storage
              .from('media')
              .getPublicUrl(`posters/${file.name}`);

            console.log('🔗 URL generada para imagen:', publicUrl);

            existingFiles.push({
              id: `existing-image-${file.name}`,
              file: new File([], file.name), // File placeholder
              type: 'image',
              progress: 100,
              status: 'success',
              url: publicUrl
            });
          }
        });
      } else {
        console.log('📁 No se encontraron archivos de imagen');
      }

      // NUEVO: Procesar archivos de la raíz
      if (rootFiles && rootFiles.length > 0) {
        console.log(`📁 Procesando ${rootFiles.length} archivos de la raíz...`);
        rootFiles.forEach(file => {
          console.log('📄 Procesando archivo de raíz:', file);
          if (file.name && !file.name.includes('.emptyFolderPlaceholder') && !file.name.includes('/')) {
            // Determinar tipo por extensión
            const extension = file.name.toLowerCase().split('.').pop();
            const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension || '');
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
            
            if (isVideo || isImage) {
              const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(file.name);

              console.log('🔗 URL generada para archivo de raíz:', publicUrl);

              existingFiles.push({
                id: `existing-root-${file.name}`,
                file: new File([], file.name),
                type: isVideo ? 'video' : 'image',
                progress: 100,
                status: 'success',
                url: publicUrl
              });
            }
          }
        });
      } else {
        console.log('📁 No se encontraron archivos en la raíz');
      }

      console.log('📋 Archivos procesados total:', existingFiles);
      setFiles(existingFiles);
      console.log(`✅ Cargados ${existingFiles.length} archivos existentes`);

    } catch (error) {
      console.error('❌ Error completo cargando archivos existentes:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      id: `new-${type}-${Math.random().toString(36).substring(2, 11)}`,
      file,
      type,
      progress: 0,
      status: 'waiting'
    }));

    // Agregar a los archivos existentes en lugar de reemplazarlos
    setFiles(prev => [...prev, ...newFiles]);
    console.log(`📁 Agregados ${newFiles.length} archivos de ${type} para subir`);
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const folder = uploadFile.type === 'video' ? 'videos' : 'posters';
    const fileExt = uploadFile.file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    try {
      // Actualizar estado a uploading
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading' }
            : f
        )
      );

      const { error } = await supabase.storage
        .from('media')
        .upload(filePath, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Actualizar estado a success
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'success', progress: 100, url: publicUrl }
            : f
        )
      );

    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Actualizar estado a error
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Error desconocido' }
            : f
        )
      );
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    
    const filesToUpload = files.filter(f => f.status === 'waiting');
    
    for (const file of filesToUpload) {
      await uploadFile(file);
    }
    
    setIsUploading(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const handleTituloChange = (field: keyof TituloForm, value: any) => {
    setTituloForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Extrae la duración de un video dado su URL (en segundos)
  const getVideoDuration = (videoUrl: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        if (video.duration && !isNaN(video.duration)) {
          resolve(video.duration);
        } else {
          reject(new Error('No se pudo obtener la duración del video.'));
        }
      };
      video.onerror = () => reject(new Error('Error cargando el video para extraer duración.'));
    });
  };

  const saveTitulo = async () => {
    try {
      setIsSavingTitle(true);

      // Validar campos requeridos
      if (!tituloForm.titulo.trim()) {
        throw new Error('El título es requerido');
      }

      console.log('🔄 Intentando guardar título:', tituloForm.titulo);
      console.log('📋 Datos del formulario:', tituloForm);

      // Preparar los datos para insertar
      const dataToInsert = {
        titulo: tituloForm.titulo.trim(),
        descripcion: tituloForm.descripcion.trim() || null,
        tipo: tituloForm.tipo,
        categoria: tituloForm.categoria.trim() || null,
        año: tituloForm.año,
        duracion: tituloForm.duracion.trim() || null,
        duracion_segundos: tituloForm.duracion_segundos ?? null,
        director: tituloForm.director.trim() || null,
        actores: tituloForm.actores.trim() || null,
        genero: tituloForm.genero.trim() || null,
        edad_minima: tituloForm.edad_minima,
        url_video: tituloForm.url_video.trim() || null,
        imagen_portada: tituloForm.imagen_portada.trim() || null,
        visible: tituloForm.visible
      };

      console.log('📤 Datos preparados para insertar:', dataToInsert);

      // Crear un timeout para evitar que se quede cargando indefinidamente
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado (30 segundos)')), 30000)
      );

      console.log('⏱️ Iniciando inserción con timeout de 30 segundos...');

      const insertPromise = supabase
        .from('titulos')
        .insert([dataToInsert])
        .select();

      const result = await Promise.race([insertPromise, timeout]);
      const { data, error } = result as any;

      console.log('📊 Respuesta completa de Supabase:', result);
      console.log('📊 Data:', data);
      console.log('📊 Error:', error);

      if (error) {
        console.error('❌ Error específico de Supabase:', error);
        console.error('❌ Tipo de error:', typeof error);
        console.error('❌ Propiedades del error:', Object.keys(error));
        console.error('❌ Código de error:', error.code);
        console.error('❌ Detalles del error:', error.details);
        console.error('❌ Hint del error:', error.hint);
        console.error('❌ Mensaje completo:', error.message);
        throw error;
      }

      // Verificar si los datos se devolvieron correctamente
      if (!data) {
        throw new Error('No se recibieron datos de la inserción');
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('La inserción no devolvió registros');
      }

      // Agregar a la lista de títulos subidos
      setUploadedTitles(prev => [...prev, ...data]);
      console.log('✅ Título guardado exitosamente:', data[0]);
      alert('✅ Título guardado correctamente');

      // Resetear formulario
      setTituloForm(defaultTitulo);

    } catch (error) {
      console.error('❌ Error completo al guardar título:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack available');
      
      // Mostrar detalles específicos del error
      let errorMessage = 'Error desconocido al guardar el título';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Casos específicos de errores comunes
        if (error.message.includes('relation "titulos" does not exist')) {
          errorMessage = 'La tabla "titulos" no existe en la base de datos. Necesitas crearla primero usando el script SQL proporcionado.';
        } else if (error.message.includes('row-level security')) {
          errorMessage = 'Error de permisos (RLS). La tabla "titulos" tiene políticas de seguridad que impiden la inserción.';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'No tienes permisos para insertar en la tabla "titulos". Verifica las políticas RLS o desactiva RLS temporalmente.';
        } else if (error.message.includes('Timeout')) {
          errorMessage = 'La operación tardó demasiado tiempo (30+ segundos). Verifica tu conexión a internet y que la base de datos esté funcionando.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Ya existe un título con ese nombre.';
        } else if (error.message.includes('violates check constraint')) {
          errorMessage = 'Hay un error en los datos. Revisa que el tipo sea válido (pelicula, serie, documental, trailer).';
        } else if (error.message.includes('null value')) {
          errorMessage = 'Faltan campos requeridos. El título es obligatorio.';
        } else if (error.message.includes('invalid input syntax')) {
          errorMessage = 'Hay un error en el formato de los datos. Revisa el año y la edad mínima.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Error de conexión de red. Verifica tu conexión a internet.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con Supabase. Verifica la configuración de URL y API Key.';
        }
      }
      
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsSavingTitle(false);
    }
  };

  // Cuando el usuario selecciona un archivo subido, si es video, extrae duración y la pone en el campo 'duracion' (en minutos redondeado)
  const selectUploadedFile = async (url: string, type: 'video' | 'image') => {
    if (type === 'video') {
      handleTituloChange('url_video', url);
      // Extraer duración automáticamente
      try {
        const durationSeconds = await getVideoDuration(url);
    handleTituloChange('duracion_segundos', Math.round(durationSeconds));
      } catch (e) {
        // Si falla, no interrumpe el flujo
        console.warn('No se pudo extraer la duración del video:', e);
        handleTituloChange('duracion_segundos', null);
      }
    } else {
      handleTituloChange('imagen_portada', url);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  const stats = {
    total: files.length,
    uploaded: files.filter(f => f.status === 'success').length,
    errors: files.filter(f => f.status === 'error').length,
    pending: files.filter(f => f.status === 'waiting').length
  };

  return (
    <AdminLayout 
      title="Subir Contenido" 
      description="Gestionar archivos y títulos"
    >
      <div className="space-y-6">
        {/* Navegación por pestañas */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'files'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Subir Archivos
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'titles'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Film className="w-4 h-4 inline mr-2" />
            Crear Títulos
          </button>
        </div>

        {/* Contenido de la pestaña Archivos */}
        {activeTab === 'files' && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Subidos</p>
                <p className="text-2xl font-bold text-green-400">{stats.uploaded}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Errores</p>
                <p className="text-2xl font-bold text-red-400">{stats.errors}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Upload className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Controles de subida */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-red-500" />
            Subir Archivos
            {isLoadingFiles && (
              <Loader2 className="w-4 h-4 ml-2 animate-spin text-blue-400" />
            )}
          </h2>

          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mr-3" />
              <span className="text-gray-300">Cargando archivos existentes...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Subir Videos */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
              <FileVideo className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Videos</h3>
              <p className="text-gray-400 mb-4">Sube archivos de video (MP4, MOV, AVI)</p>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileSelect(e, 'video')}
                className="hidden"
                id="video-upload"
              />
              <Button 
                onClick={() => document.getElementById('video-upload')?.click()}
                className="cursor-pointer"
              >
                Seleccionar Videos
              </Button>
            </div>

            {/* Subir Imágenes */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
              <ImageIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Imágenes</h3>
              <p className="text-gray-400 mb-4">Sube imágenes (JPG, PNG, WebP)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'image')}
                className="hidden"
                id="image-upload"
              />
              <Button 
                onClick={() => document.getElementById('image-upload')?.click()}
                className="cursor-pointer"
              >
                Seleccionar Imágenes
              </Button>
              </div>
            </div>

            {/* Botones de acción */}
            {files.length > 0 && (
              <div className="flex space-x-4">
                <Button
                  onClick={handleUploadAll}
                  disabled={isUploading || stats.pending === 0}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isUploading ? 'Subiendo...' : `Subir ${stats.pending} archivos`}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={isUploading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Limpiar Todo
                </Button>
              </div>
            )}
            </>
          )}
        </div>        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Archivos ({files.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={loadExistingFiles}
                disabled={isLoadingFiles}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {isLoadingFiles ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Recargar'
                )}
              </Button>
            </div>
            
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex items-center space-x-2">
                      {file.type === 'video' ? (
                        <FileVideo className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-white text-sm font-medium">{file.file.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {file.status === 'success' && file.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(file.url!)}
                        className="text-green-400 hover:text-green-300"
                      >
                        Copiar URL
                      </Button>
                    )}
                    
                    {file.status === 'error' && (
                      <span className="text-xs text-red-400">{file.error}</span>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                      className="text-gray-400 hover:text-red-400"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <Alert>
          <Upload className="w-4 h-4" />
          <div>
            <h4 className="font-semibold">Instrucciones:</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Los videos se suben a la carpeta &apos;videos&apos; en el bucket &apos;media&apos;</li>
              <li>• Las imágenes se suben a la carpeta &apos;posters&apos; en el bucket &apos;media&apos;</li>
              <li>• Los archivos existentes se cargan automáticamente al abrir la página</li>
              <li>• Una vez subidos, puedes copiar las URLs para usar en títulos</li>
              <li>• Los archivos se renombran automáticamente para evitar conflictos</li>
              <li>• Usa el botón &apos;Recargar&apos; si no ves archivos recién subidos</li>
            </ul>
          </div>
        </Alert>
          </>
        )}

        {/* Contenido de la pestaña Títulos */}
        {activeTab === 'titles' && (
          <>
            {/* Formulario de título */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Film className="w-6 h-6 mr-2 text-red-500" />
                  Crear Nuevo Título
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="titulo" className="block text-sm font-medium text-gray-300 mb-2">
                        Título *
                      </label>
                      <Input
                        id="titulo"
                        value={tituloForm.titulo}
                        onChange={(e) => handleTituloChange('titulo', e.target.value)}
                        placeholder="Nombre del título"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="tipo" className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo
                      </label>
                      <select
                        id="tipo"
                        value={tituloForm.tipo}
                        onChange={(e) => handleTituloChange('tipo', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="pelicula">Película</option>
                        <option value="serie">Serie</option>
                        <option value="documental">Documental</option>
                        <option value="trailer">Trailer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="categoria" className="block text-sm font-medium text-gray-300 mb-2">
                        Categoría
                      </label>
                      <Input
                        id="categoria"
                        value={tituloForm.categoria}
                        onChange={(e) => handleTituloChange('categoria', e.target.value)}
                        placeholder="Ej: Acción, Drama, Comedia"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="año" className="block text-sm font-medium text-gray-300 mb-2">
                          Año
                        </label>
                        <Input
                          id="año"
                          type="number"
                          value={tituloForm.año}
                          onChange={(e) => handleTituloChange('año', parseInt(e.target.value) || new Date().getFullYear())}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="duracion" className="block text-sm font-medium text-gray-300 mb-2">
                          Duración
                        </label>
                        <Input
                          id="duracion"
                          value={tituloForm.duracion}
                          onChange={(e) => handleTituloChange('duracion', e.target.value)}
                          placeholder="Ej: 120 min"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="genero" className="block text-sm font-medium text-gray-300 mb-2">
                          Género
                        </label>
                        <Input
                          id="genero"
                          value={tituloForm.genero}
                          onChange={(e) => handleTituloChange('genero', e.target.value)}
                          placeholder="Ej: Acción, Suspenso"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="edad_minima" className="block text-sm font-medium text-gray-300 mb-2">
                          Edad Mínima
                        </label>
                        <Input
                          id="edad_minima"
                          type="number"
                          min="0"
                          max="18"
                          value={tituloForm.edad_minima === 0 ? '' : tituloForm.edad_minima}
                          onChange={(e) => handleTituloChange('edad_minima', parseInt(e.target.value) || 0)}
                          onFocus={(e) => {
                            if (tituloForm.edad_minima === 0) {
                              e.target.select();
                            }
                          }}
                          placeholder="0"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        value={tituloForm.descripcion}
                        onChange={(e) => handleTituloChange('descripcion', e.target.value)}
                        placeholder="Descripción del contenido..."
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="director" className="block text-sm font-medium text-gray-300 mb-2">
                        Director
                      </label>
                      <Input
                        id="director"
                        value={tituloForm.director}
                        onChange={(e) => handleTituloChange('director', e.target.value)}
                        placeholder="Nombre del director"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="actores" className="block text-sm font-medium text-gray-300 mb-2">
                        Actores
                      </label>
                      <Input
                        id="actores"
                        value={tituloForm.actores}
                        onChange={(e) => handleTituloChange('actores', e.target.value)}
                        placeholder="Actores principales (separados por comas)"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="url_video" className="block text-sm font-medium text-gray-300 mb-2">
                        URL del Video
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          id="url_video"
                          value={tituloForm.url_video}
                          onChange={async (e) => {
                            const url = e.target.value;
                            handleTituloChange('url_video', url);
                            // Si parece un enlace directo a un archivo de video, intenta extraer duración
                            if (url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.endsWith('.mkv') || url.endsWith('.avi'))) {
                              try {
                                const durationSeconds = await getVideoDuration(url);
                                handleTituloChange('duracion_segundos', Math.round(durationSeconds));
                              } catch (e) {
                                console.warn('No se pudo extraer la duración del video:', e);
                                handleTituloChange('duracion_segundos', null);
                              }
                            } else {
                              // Si no es un archivo directo, limpia el campo de segundos
                              handleTituloChange('duracion_segundos', null);
                            }
                          }}
                          placeholder="URL del video"
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                        {files.filter(f => f.type === 'video' && f.status === 'success').length > 0 && (
                          <select
                            onChange={async (e) => {
                              if (e.target.value) await selectUploadedFile(e.target.value, 'video');
                            }}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            defaultValue=""
                          >
                            <option value="">Usar archivo subido</option>
                            {files.filter(f => f.type === 'video' && f.status === 'success').map(f => (
                              <option key={f.id} value={f.url}>{f.file.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="imagen_portada" className="block text-sm font-medium text-gray-300 mb-2">
                        URL de la Portada
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          id="imagen_portada"
                          value={tituloForm.imagen_portada}
                          onChange={(e) => handleTituloChange('imagen_portada', e.target.value)}
                          placeholder="URL de la imagen de portada"
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                        />
                        {files.filter(f => f.type === 'image' && f.status === 'success').length > 0 && (
                          <select
                            onChange={(e) => e.target.value && selectUploadedFile(e.target.value, 'image')}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            defaultValue=""
                          >
                            <option value="">Usar archivo subido</option>
                            {files.filter(f => f.type === 'image' && f.status === 'success').map(f => (
                              <option key={f.id} value={f.url}>{f.file.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="visible"
                        checked={tituloForm.visible}
                        onChange={(e) => handleTituloChange('visible', e.target.checked)}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <label htmlFor="visible" className="text-sm text-gray-300">
                        Visible para los usuarios
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <Button
                    onClick={saveTitulo}
                    disabled={isSavingTitle || !tituloForm.titulo.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isSavingTitle ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Título
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setTituloForm(defaultTitulo)}
                    disabled={isSavingTitle}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>

                  <Button
                    variant="outline"
                    onClick={checkDatabaseConnection}
                    disabled={isSavingTitle}
                    className="border-blue-600 text-blue-300 hover:bg-blue-900"
                  >
                    🔍 Probar Conexión DB
                  </Button>

                  <Button
                    variant="outline"
                    onClick={testCurrentFormData}
                    disabled={isSavingTitle}
                    className="border-yellow-600 text-yellow-300 hover:bg-yellow-900"
                  >
                    🧪 Probar Datos Actuales
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Títulos guardados */}
            {uploadedTitles.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Títulos Guardados ({uploadedTitles.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {uploadedTitles.map((titulo) => (
                      <div key={titulo.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Film className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{titulo.titulo}</p>
                            <p className="text-sm text-gray-400 capitalize">{titulo.tipo} • {titulo.año}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {titulo.visible ? (
                            <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Visible</span>
                          ) : (
                            <span className="text-xs bg-gray-900 text-gray-300 px-2 py-1 rounded">Oculto</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instrucciones para títulos */}
            <Alert>
              <Film className="w-4 h-4" />
              <div>
                <h4 className="font-semibold">Instrucciones para Títulos:</h4>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Completa al menos el título para poder guardar</li>
                  <li>• Puedes usar URLs de archivos que hayas subido en la pestaña anterior</li>
                  <li>• Los títulos se guardan en la tabla &apos;titulos&apos; de la base de datos</li>
                  <li>• Marca como visible solo cuando el contenido esté listo para mostrar</li>
                </ul>
              </div>
            </Alert>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
