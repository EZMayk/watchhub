'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { 
  Folder, 
  FileVideo, 
  Image as ImageIcon,
  Trash2,
  Search,
  Eye,
  Copy,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

interface FileWithUrl extends StorageFile {
  publicUrl: string;
  type: 'video' | 'image';
  sizeFormatted: string;
  folder: string; // Agregar carpeta de origen
}

export default function ArchivosPage() {
  const [files, setFiles] = useState<FileWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<'all' | 'videos' | 'posters'>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allFiles: FileWithUrl[] = [];
      const foldersToFetch = selectedBucket === 'all' ? ['videos', 'posters'] : [selectedBucket];
      
      console.log('🔄 Cargando archivos de carpetas:', foldersToFetch);
      
      for (const folder of foldersToFetch) {
        console.log(`📂 Obteniendo archivos de la carpeta: media/${folder}`);
        
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from('media')
          .list(folder, {
            limit: 1000, // Aumentar límite
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (folderError) {
          console.error(`❌ Error fetching media/${folder}:`, folderError);
          // Continuar con otras carpetas pero mostrar el error
          setError(`Error al cargar archivos de media/${folder}: ${folderError.message}`);
          continue;
        }

        if (folderFiles && folderFiles.length > 0) {
          console.log(`✅ Encontrados ${folderFiles.length} archivos en media/${folder}`);
          
          const filesWithUrls = folderFiles
            .filter(file => {
              // Filtrar archivos que no sean carpetas (archivos sin extensión o con nombre extraño)
              return file.name && 
                     !file.name.endsWith('/') && 
                     file.name !== '.emptyFolderPlaceholder' &&
                     file.metadata;
            })
            .map(file => {
              const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(`${folder}/${file.name}`);

              return {
                ...file,
                publicUrl,
                type: folder === 'videos' ? 'video' as const : 'image' as const,
                sizeFormatted: formatFileSize(file.metadata?.size || 0),
                folder: folder // Agregar información de la carpeta
              };
            });

          allFiles.push(...filesWithUrls);
          console.log(`📊 Procesados ${filesWithUrls.length} archivos válidos de media/${folder}`);
        } else {
          console.log(`📭 No se encontraron archivos en media/${folder}`);
        }
      }

      console.log(`🎯 Total de archivos cargados: ${allFiles.length}`);
      setFiles(allFiles);
      
    } catch (err) {
      console.error('💥 Error general fetching files:', err);
      setError(`Error al cargar los archivos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar archivos inmediatamente al montar el componente
    fetchFiles();
  }, [selectedBucket]);

  // Efecto para recargar periódicamente (opcional)
  useEffect(() => {
    const interval = setInterval(() => {
      // Recargar cada 5 minutos para mantener datos actualizados
      fetchFiles();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedBucket]);

  const handleDeleteFile = async (fileName: string, fileType: 'video' | 'image', folder: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${fileName}?`)) {
      return;
    }

    try {
      const filePath = `${folder}/${fileName}`;
      const { error } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (error) throw error;

      // Actualizar la lista
      setFiles(prev => prev.filter(f => f.name !== fileName));
      setSelectedFiles(prev => prev.filter(f => f !== fileName));
      
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Error al eliminar el archivo');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedFiles.length} archivos?`)) {
      return;
    }

    try {
      for (const fileName of selectedFiles) {
        const file = files.find(f => f.name === fileName);
        if (file) {
          const filePath = `${file.folder}/${fileName}`;
          await supabase.storage.from('media').remove([filePath]);
        }
      }

      // Actualizar la lista
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.name)));
      setSelectedFiles([]);
      
    } catch (err) {
      console.error('Error deleting files:', err);
      alert('Error al eliminar los archivos');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Mostrar notificación de éxito temporal
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalTitle = button.title;
        button.title = '¡Copiado!';
        button.style.color = '#10b981'; // green-500
        setTimeout(() => {
          button.title = originalTitle || 'Copiar URL';
          button.style.color = '';
        }, 2000);
      }
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar la URL');
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: files.length,
    videos: files.filter(f => f.type === 'video').length,
    images: files.filter(f => f.type === 'image').length,
    totalSize: files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0)
  };

  return (
    <AdminLayout 
      title="Gestión de Archivos" 
      description="Administrar archivos de video e imágenes"
    >
      <div className="space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Archivos</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Folder className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Videos</p>
                <p className="text-2xl font-bold text-blue-400">{stats.videos}</p>
              </div>
              <FileVideo className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Imágenes</p>
                <p className="text-2xl font-bold text-green-400">{stats.images}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tamaño Total</p>
                <p className="text-2xl font-bold text-purple-400">{formatFileSize(stats.totalSize)}</p>
              </div>
              <Folder className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar archivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filtro por tipo */}
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value as 'all' | 'videos' | 'posters')}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
              >
                <option value="all">Todos los archivos</option>
                <option value="videos">Solo videos</option>
                <option value="posters">Solo pósters</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={fetchFiles}
                disabled={loading}
                variant="outline"
                className="border-gray-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>

              {selectedFiles.length > 0 && (
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar ({selectedFiles.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="error">
            <AlertCircle className="w-4 h-4" />
            <div>{error}</div>
          </Alert>
        )}

        {/* Lista de archivos */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-400">Cargando archivos...</span>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  {files.length === 0 ? 'No hay archivos almacenados' : 'No se encontraron archivos'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {(() => {
                    if (searchTerm) {
                      return `No se encontraron archivos que coincidan con "${searchTerm}"`;
                    }
                    if (files.length === 0) {
                      return 'Los archivos aparecerán aquí cuando subas contenido desde la sección "Subir Contenido"';
                    }
                    return 'Intenta cambiar los filtros de búsqueda';
                  })()}
                </p>
                {files.length === 0 && (
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>💡 <strong>Para subir archivos:</strong></p>
                    <p>1. Ve a &quot;Subir Contenido&quot; en el menú lateral</p>
                    <p>2. Sube videos e imágenes</p>
                    <p>3. Los archivos aparecerán automáticamente aquí</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles(filteredFiles.map(f => f.name));
                            } else {
                              setSelectedFiles([]);
                            }
                          }}
                          className="rounded border-gray-600 bg-gray-700"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">Archivo</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Carpeta</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Tipo</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Tamaño</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Fecha</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredFiles.map((file) => (
                      <tr key={file.name} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles(prev => [...prev, file.name]);
                              } else {
                                setSelectedFiles(prev => prev.filter(f => f !== file.name));
                              }
                            }}
                            className="rounded border-gray-600 bg-gray-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {file.type === 'video' ? (
                              <FileVideo className="w-5 h-5 text-blue-400" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-green-400" />
                            )}
                            <div>
                              <p className="text-white font-medium truncate max-w-xs" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Creado: {new Date(file.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            file.folder === 'videos' 
                              ? 'bg-purple-900 text-purple-300'
                              : 'bg-orange-900 text-orange-300'
                          }`}>
                            media/{file.folder}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            file.type === 'video' 
                              ? 'bg-blue-900 text-blue-300'
                              : 'bg-green-900 text-green-300'
                          }`}>
                            {file.type === 'video' ? 'Video' : 'Póster'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{file.sizeFormatted}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {file.created_at 
                            ? new Date(file.created_at).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Fecha desconocida'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.publicUrl, '_blank')}
                              className="text-gray-400 hover:text-white"
                              title="Ver archivo"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(file.publicUrl)}
                              className="text-gray-400 hover:text-white"
                              title="Copiar URL"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFile(file.name, file.type, file.folder)}
                              className="text-gray-400 hover:text-red-400"
                              title="Eliminar archivo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Información */}
        <Alert>
          <Folder className="w-4 h-4" />
          <div>
            <h4 className="font-semibold">Gestión de Archivos:</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Visualiza todos los archivos almacenados en Supabase Storage</li>
              <li>• Filtra por tipo de archivo (videos o imágenes)</li>
              <li>• Copia URLs para usar en títulos o contenido</li>
              <li>• Elimina archivos individualmente o en lote</li>
            </ul>
          </div>
        </Alert>
      </div>
    </AdminLayout>
  );
}
