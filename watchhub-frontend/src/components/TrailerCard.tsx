// components/TrailerCard.tsx
'use client'
import Hls from 'hls.js'
import { useRef, useEffect, useState } from 'react'
import { Play, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, Button, Badge } from './ui'
import { useVideoPlayer } from '@/contexts/VideoPlayerContext'

interface TrailerCardProps {
  titulo: {
    id: string
    titulo: string
    descripcion: string
    imagen_portada: string
    url_video: string
    tipo: string
    categoria: string
    año: number
    duracion: string
    director: string
    actores: string
    genero: string
    edad_minima: number
    visible: boolean
    created_at: string
    updated_at: string
  }
}

export default function TrailerCard({ titulo }: Readonly<TrailerCardProps>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  
  // Usar el contexto global del video player de manera simple
  const { activeVideoId, setActiveVideo } = useVideoPlayer()
  
  // Variables de estado simples
  const hasActiveVideo = activeVideoId !== null
  const isThisVideoActive = activeVideoId === titulo.id

  // Función para detectar y convertir URLs de YouTube
  const getVideoConfig = (url: string) => {
    // YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || ''
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || ''
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
      }
      
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
        originalUrl: url
      }
    }
    
    // Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0] || ''
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        originalUrl: url
      }
    }
    
    // URLs directas de video (MP4, HLS, etc.)
    return {
      type: 'direct',
      embedUrl: url,
      originalUrl: url
    }
  }

  const videoConfig = getVideoConfig(titulo.url_video)

  // Manejar reproducción directa en la tarjeta - PERMITE regresar a videos anteriores
  const handleOpenPlayer = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Si es el mismo video que está activo y reproduciéndose, no hacer nada
    if (isThisVideoActive && showPlayer) {
      console.log('⚠️ Este video ya está reproduciéndose')
      return
    }
    
    console.log('🎬 Reproduciendo video:', titulo.titulo)
    
    // Siempre permitir reproducir cualquier video
    setIsHovered(false)       // 1. Limpiar hover
    setActiveVideo(titulo.id) // 2. Marcar como activo (automáticamente pausa otros)
    setShowPlayer(true)       // 3. Mostrar video EN LA TARJETA
  }

  // Manejar cierre del video directamente en la tarjeta
  const handleClosePlayer = () => {
    console.log('❌ Deteniendo video en tarjeta:', titulo.titulo)
    
    // Pasos de cierre
    setShowPlayer(false)      // 1. Ocultar video
    setActiveVideo(null)      // 2. Desactivar video
    setIsVideoLoading(false)  // 3. Limpiar loading
    setIsHovered(false)       // 4. Limpiar hover
    
    // Limpiar video si es directo
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
    }
  }

  // Efecto para limpiar estado cuando se desactiva el video
  useEffect(() => {
    if (!activeVideoId && showPlayer) {
      setShowPlayer(false)
      setIsVideoLoading(false)
      setIsHovered(false)
    }
  }, [activeVideoId, showPlayer])

  // Efecto para limpiar showPlayer cuando este video deja de ser el activo
  useEffect(() => {
    if (activeVideoId && activeVideoId !== titulo.id && showPlayer) {
      setShowPlayer(false)
      setIsVideoLoading(false)
    }
  }, [activeVideoId, titulo.id, showPlayer])

  // Efecto simple para limpiar hover
  useEffect(() => {
    if (hasActiveVideo) {
      setIsHovered(false)
    }
  }, [hasActiveVideo])

  // Solo configurar HLS cuando sea necesario
  useEffect(() => {
    if (videoRef.current && showPlayer && videoConfig.type === 'direct') {
      const video = videoRef.current
      setIsVideoLoading(true)
      
      if (titulo.url_video.endsWith('.m3u8')) {
        // Para videos HLS
        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(titulo.url_video)
          hls.attachMedia(video)
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsVideoLoading(false)
          })
          
          hls.on(Hls.Events.ERROR, () => {
            setIsVideoLoading(false)
          })
          
          return () => {
            hls.destroy()
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = titulo.url_video
          setIsVideoLoading(false)
        }
      } else {
        video.src = titulo.url_video
        setIsVideoLoading(false)
      }
    }
  }, [showPlayer, titulo.url_video, videoConfig.type])

  // Determinar clases CSS para la tarjeta
  const getCardClasses = () => {
    if (showPlayer && isThisVideoActive) {
      // Video reproduciéndose en esta tarjeta
      return 'cursor-default'
    }
    // Siempre permitir hover y clic
    return 'hover:scale-105 hover:shadow-xl'
  }

  return (
    <Card 
      className={`group transition-all duration-300 overflow-hidden ${getCardClasses()}`}
      padding="none"
        onMouseEnter={() => {
          // Mostrar hover SIEMPRE, excepto cuando este video específico está reproduciéndose
          if (!(showPlayer && isThisVideoActive)) {
            setIsHovered(true)
          }
        }}
        onMouseLeave={() => {
          // Limpiar hover al salir
          setIsHovered(false)
        }}
      >
        {/* Área del poster/video */}
        <div className="relative overflow-hidden">
          {/* Mostrar video directamente EN LA TARJETA si está activo */}
          {showPlayer && isThisVideoActive ? (
            <div className="relative w-full h-48 bg-black">
              {/* Para YouTube y Vimeo usar iframe */}
              {(videoConfig.type === 'youtube' || videoConfig.type === 'vimeo') ? (
                <iframe
                  src={videoConfig.embedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Trailer de ${titulo.titulo}`}
                  onLoad={() => setIsVideoLoading(false)}
                />
              ) : (
                // Para videos directos usar elemento video
                <>
                  {isVideoLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full"
                    poster={titulo.imagen_portada}
                    onLoadStart={() => setIsVideoLoading(true)}
                    onCanPlay={() => setIsVideoLoading(false)}
                    onError={() => setIsVideoLoading(false)}
                  >
                    <track kind="captions" srcLang="es" label="Español" />
                    Tu navegador no soporta video.
                  </video>
                </>
              )}
              
              {/* Botón para cerrar video */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePlayer}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/75 text-white"
              >
                ✕
              </Button>
            </div>
          ) : (
            // Mostrar imagen del poster cuando no hay video
            <>
              <img 
                src={titulo.imagen_portada}
                alt={titulo.titulo}
                className="w-full h-48 object-cover transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-movie.jpg'
                }}
              />
              
              {/* Overlay con botón de play - SIEMPRE disponible */}
              <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                isHovered && !showPlayer ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button
                  size="lg"
                  variant="gradient"
                  icon={<Play className="h-5 w-5" />}
                  onClick={handleOpenPlayer}
                  className="shadow-lg z-10"
                  type="button"
                >
                  Ver Trailer
                </Button>
              </div>
            </>
          )}
          
          {/* Badge de tipo */}
          <div className="absolute top-2 right-2">
            <Badge variant={titulo.tipo === 'Película' ? 'default' : 'secondary'}>
              {titulo.tipo}
            </Badge>
          </div>
          
          {/* Clasificación de edad */}
          {Boolean(titulo.edad_minima) && (
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-black/70">
                {titulo.edad_minima}+
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Título */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
            {titulo.titulo}
          </h3>
          
          {/* Descripción */}
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {titulo.descripcion}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {Boolean(titulo.año) && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{titulo.año}</span>
                </div>
              )}
              
              {titulo.duracion && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{titulo.duracion}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  )
}
