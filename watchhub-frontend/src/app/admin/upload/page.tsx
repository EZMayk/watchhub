'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { 
  Upload, 
  Film, 
  Image as ImageIcon, 
  FileVideo,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';

interface UploadFile {
  id: string;
  file: File;
  type: 'video' | 'image';
  progress: number;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type,
      progress: 0,
      status: 'waiting'
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const bucket = uploadFile.type === 'video' ? 'videos' : 'imagenes';
    const fileExt = uploadFile.file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

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
        .from(bucket)
        .upload(fileName, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

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
      description="Gestionar archivos de videos e imágenes"
    >
      <div className="space-y-6">
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
          </h2>

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
              <label htmlFor="video-upload">
                <Button className="cursor-pointer">
                  Seleccionar Videos
                </Button>
              </label>
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
              <label htmlFor="image-upload">
                <Button className="cursor-pointer">
                  Seleccionar Imágenes
                </Button>
              </label>
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
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Archivos ({files.length})
            </h3>
            
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
              <li>• Los videos se suben al bucket &apos;videos&apos; en Supabase Storage</li>
              <li>• Las imágenes se suben al bucket &apos;imagenes&apos; en Supabase Storage</li>
              <li>• Una vez subidos, puedes copiar las URLs para usar en títulos</li>
              <li>• Los archivos se renombran automáticamente para evitar conflictos</li>
            </ul>
          </div>
        </Alert>
      </div>
    </AdminLayout>
  );
}
