'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Play, Star, ArrowRight, Film, Users, Crown } from 'lucide-react'

export default function HomePage() {
  const [trailers, setTrailers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrailer, setSelectedTrailer] = useState<any>(null)

  useEffect(() => {
    fetchTrailers()
  }, [])

  const fetchTrailers = async () => {
    try {
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .eq('visible', true)
        .limit(6)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      setTrailers(data || [])
    } catch (error) {
      console.error('Error fetching trailers:', error)
    } finally {
      setLoading(false)
    }
  }

  const openTrailer = (trailer: any) => {
    setSelectedTrailer(trailer)
  }

  const closeTrailer = () => {
    setSelectedTrailer(null)
  }

  const scrollToTrailers = () => {
    document.getElementById('trailers')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Film className="h-16 w-16 text-red-500" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              WatchHub
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              La mejor plataforma de streaming para toda la familia. 
              Películas, series y documentales en un solo lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Crown className="mr-2 h-5 w-5" />
                Comenzar Gratis
              </Link>
              
              <Link
                href="/auth/login"
                className="border border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                Iniciar Sesión
              </Link>   
              
              <button
                onClick={scrollToTrailers}
                className="border border-gray-400 text-gray-300 hover:border-white hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Trailers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Por qué elegir WatchHub?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Contenido Exclusivo
              </h3>
              <p className="text-gray-400">
                Accede a miles de películas, series y documentales exclusivos.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Perfiles Familiares
              </h3>
              <p className="text-gray-400">
                Hasta 5 perfiles por cuenta con recomendaciones personalizadas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Calidad Premium
              </h3>
              <p className="text-gray-400">
                Streaming en 4K con audio de alta calidad y sin interrupciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trailers Section */}
      <div id="trailers" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trailers Destacados
            </h2>
            <p className="text-gray-400">
              Descubre las mejores películas y series
            </p>
          </div>
          
          {loading ? (
            <div className="text-center">
              <div className="text-white">Cargando trailers...</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trailers.map((trailer) => (
                <div
                  key={trailer.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative">
                    <img
                      src={trailer.url_poster || 'https://via.placeholder.com/400x225'}
                      alt={trailer.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => openTrailer(trailer)}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-12 w-12 text-white" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {trailer.nombre}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {trailer.descripcion}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-400">
                          {trailer.clasificacion_edad || 'TP'}
                        </span>
                      </div>
                      
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                        {trailer.tipo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Únete a millones de usuarios que ya disfrutan de WatchHub
          </p>
          <Link
            href="/auth/register"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Trailer Modal */}
      {selectedTrailer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                {selectedTrailer.nombre}
              </h3>
              <button
                onClick={closeTrailer}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <video
                controls
                className="w-full h-64 md:h-96 bg-black rounded"
                poster={selectedTrailer.url_poster}
              >
                <source src={selectedTrailer.url_streaming} type="application/x-mpegURL" />
                Tu navegador no soporta el elemento de video.
              </video>
              
              <div className="mt-4">
                <p className="text-gray-300">{selectedTrailer.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}