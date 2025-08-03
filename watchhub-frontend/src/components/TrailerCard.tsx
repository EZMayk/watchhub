// components/TrailerCard.tsx
'use client'
import Hls from 'hls.js'
import { useRef, useEffect, useState } from 'react'
import { Play, Star, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, Button, Badge, Modal } from './ui'

interface TrailerCardProps {
  titulo: {
    id: string
    nombre: string
    descripcion: string
    url_poster: string
    url_streaming: string
    tipo: string
    clasificacion_edad?: string
    duracion?: number
    fecha_estreno?: string
    calificacion?: number
  }
}

export default function TrailerCard({ titulo }: TrailerCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (videoRef.current && showPlayer) {
      const hls = new Hls()
      hls.loadSource(titulo.url_streaming)
      hls.attachMedia(videoRef.current)
    }
  }, [showPlayer, titulo.url_streaming])

  const formatDuration = (minutes?: number) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).getFullYear()
  }

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
            src={titulo.url_poster} 
            alt={titulo.nombre} 
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" 
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
          {titulo.clasificacion_edad && (
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-black/70">
                {titulo.clasificacion_edad}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Título */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">
            {titulo.nombre}
          </h3>
          
          {/* Descripción */}
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {titulo.descripcion}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {titulo.calificacion && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span>{titulo.calificacion.toFixed(1)}</span>
                </div>
              )}
              
              {titulo.fecha_estreno && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(titulo.fecha_estreno)}</span>
                </div>
              )}
              
              {titulo.duracion && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(titulo.duracion)}</span>
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
        title={titulo.nombre}
        size="xl"
      >
        <div className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full h-full"
              poster={titulo.url_poster}
            >
              Tu navegador no soporta video.
            </video>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{titulo.tipo}</Badge>
              {titulo.clasificacion_edad && (
                <Badge variant="outline">{titulo.clasificacion_edad}</Badge>
              )}
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              {titulo.descripcion}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              {titulo.calificacion && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{titulo.calificacion.toFixed(1)}/10</span>
                </div>
              )}
              
              {titulo.fecha_estreno && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(titulo.fecha_estreno)}</span>
                </div>
              )}
              
              {titulo.duracion && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(titulo.duracion)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
