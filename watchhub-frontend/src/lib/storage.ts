import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export class StorageManager {
  private static instance: StorageManager;

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Sube una imagen al bucket de posters
   */
  async uploadPoster(file: File, fileName?: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `poster_${Date.now()}.${fileExt}`;
      const filePath = `posters/${finalFileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Error uploading poster:', error);
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Sube un video al bucket de videos
   */
  async uploadVideo(file: File, fileName?: string): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `video_${Date.now()}.${fileExt}`;
      const filePath = `videos/${finalFileName}`;

      // Para videos grandes, usar upload con progress
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un archivo del storage
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Lista archivos en una carpeta
   */
  async listFiles(folder: string) {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list(folder, {
          limit: 100,
          offset: 0
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}

// Hook para usar el StorageManager
export function useStorage() {
  const storage = StorageManager.getInstance();
  
  return {
    uploadPoster: (file: File, fileName?: string) => storage.uploadPoster(file, fileName),
    uploadVideo: (file: File, fileName?: string) => storage.uploadVideo(file, fileName),
    deleteFile: (path: string) => storage.deleteFile(path),
    getPublicUrl: (path: string) => storage.getPublicUrl(path),
    listFiles: (folder: string) => storage.listFiles(folder)
  };
}
