// Ejemplo de uso del sistema de Storage de WatchHub
// Este archivo muestra cómo subir archivos y crear títulos

import { useStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export function ExampleUsage() {
  const { uploadPoster, uploadVideo } = useStorage();

  // Ejemplo de cómo crear un título completo con archivos
  const createTitleWithFiles = async (
    titleData: {
      nombre: string;
      descripcion: string;
      categoria: string;
      tipo: 'pelicula' | 'serie' | 'documental';
      edad_minima: number;
    },
    posterFile: File,
    videoFile?: File
  ) => {
    try {
      console.log('📤 Subiendo archivos...');

      // 1. Subir imagen de portada
      const posterResult = await uploadPoster(posterFile, `${titleData.nombre}_poster`);
      if (posterResult.error) {
        throw new Error(`Error subiendo imagen: ${posterResult.error}`);
      }

      console.log('✅ Imagen subida:', posterResult.url);

      // 2. Subir video (opcional)
      let videoUrl = '';
      if (videoFile) {
        const videoResult = await uploadVideo(videoFile, `${titleData.nombre}_video`);
        if (videoResult.error) {
          throw new Error(`Error subiendo video: ${videoResult.error}`);
        }
        videoUrl = videoResult.url;
        console.log('✅ Video subido:', videoUrl);
      }

      // 3. Crear el título en la base de datos
      const { data, error } = await supabase
        .from('titulos')
        .insert({
          ...titleData,
          imagen_portada: posterResult.url,
          url_video: videoUrl,
          visible: true, // Publicar inmediatamente
          fecha_creacion: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('🎉 Título creado exitosamente:', data);
      
      // ¡El título aparecerá automáticamente en la lista del admin
      // gracias a las actualizaciones en tiempo real!
      
      return data;

    } catch (error) {
      console.error('❌ Error creando título:', error);
      throw error;
    }
  };

  // Ejemplo de uso desde un formulario
  const handleFormSubmit = async (formData: FormData) => {
    const titleData = {
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
      categoria: formData.get('categoria') as string,
      tipo: formData.get('tipo') as 'pelicula' | 'serie' | 'documental',
      edad_minima: parseInt(formData.get('edad_minima') as string)
    };

    const posterFile = formData.get('poster') as File;
    const videoFile = formData.get('video') as File;

    await createTitleWithFiles(titleData, posterFile, videoFile);
  };

  return { createTitleWithFiles, handleFormSubmit };
}

// Ejemplo de estructura de archivos recomendada:
/*
Storage Structure:
media/
├── posters/
│   ├── spiderman_poster.jpg
│   ├── mandalorian_poster.jpg
│   └── dune_poster.jpg
└── videos/
    ├── spiderman_trailer.mp4
    ├── mandalorian_trailer.mp4
    └── dune_trailer.mp4

URLs generadas automáticamente:
- https://proyecto.supabase.co/storage/v1/object/public/media/posters/spiderman_poster.jpg
- https://proyecto.supabase.co/storage/v1/object/public/media/videos/spiderman_trailer.mp4
*/
