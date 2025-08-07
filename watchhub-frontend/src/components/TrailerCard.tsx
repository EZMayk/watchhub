// components/TrailerCard.tsx
'use client'
import Hls from 'hls.js'
import { useRef, useEffect, useState } from 'react'
import { Play, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, Button, Badge, Modal } from './ui'

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

  useEffect(() => {
    if (videoRef.current && showPlayer) {
      const video = videoRef.current
      setIsVideoLoading(true)
      
      const handleLoadStart = () => setIsVideoLoading(true)
      const handleCanPlay = () => setIsVideoLoading(false)
      const handleError = () => setIsVideoLoading(false)
      
      video.addEventListener('loadstart', handleLoadStart)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)
      
      if (titulo.url_video.endsWith('.m3u8')) {
        // Para videos HLS
        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(titulo.url_video)
          hls.attachMedia(video)
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('Error HLS:', data)
            setIsVideoLoading(false)
          })
          
          return () => {
            hls.destroy()
            video.removeEventListener('loadstart', handleLoadStart)
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari nativo
          video.src = titulo.url_video
        }
      } else {
        // Para videos regulares (MP4, etc.)
        video.src = titulo.url_video
      }
      
      return () => {
        video.removeEventListener('loadstart', handleLoadStart)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
      }
    }
  }, [showPlayer, titulo.url_video])

  return (
    <>
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
        padding="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Imagen del poster */}
        <div className="relative overflow-hidden">
          <img 
            src={titulo.imagen_portada}
            alt={titulo.titulo}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-movie.jpg' // Agregar imagen por defecto
            }}
          />
          
          {/* Overlay con botón de play */}
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              size="lg"
              variant="gradient"
              icon={<Play className="h-5 w-5" />}
              onClick={() => setShowPlayer(true)}
              className="shadow-lg"
            >
              Ver Trailer
            </Button>
          </div>
          
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

      {/* Modal del reproductor */}
      <Modal
        isOpen={showPlayer}
        onClose={() => setShowPlayer(false)}
        title={titulo.titulo}
        size="xl"
      >
        <div className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
            {isVideoLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full h-full"
              poster={titulo.imagen_portada}
              onLoadStart={() => setIsVideoLoading(true)}
              onCanPlay={() => setIsVideoLoading(false)}
              onError={() => setIsVideoLoading(false)}
            >
              <track kind="captions" srcLang="es" label="Español" />
              Tu navegador no soporta video.
            </video>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{titulo.tipo}</Badge>
              {Boolean(titulo.edad_minima) && (
                <Badge variant="outline">{titulo.edad_minima}+</Badge>
              )}
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              {titulo.descripcion}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">              
              {Boolean(titulo.año) && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{titulo.año}</span>
                </div>
              )}
              
              {titulo.duracion && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{titulo.duracion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
