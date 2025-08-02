'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Play, Star, ArrowRight, Film, Users, Crown, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent, Badge, LoadingSpinner, Alert } from '@/components/ui'
import TrailerCard from '../components/TrailerCard'
import Navbar from '../components/Navbar'

export default function HomePage() {
  const [trailers, setTrailers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTrailers()
  }, [])

  const fetchTrailers = async () => {
    try {
      setError('')
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .eq('visible', true)
        .limit(6)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      setTrailers(data || [])
    } catch (error: any) {
      console.error('Error fetching trailers:', error)
      setError('Error al cargar los trailers. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const scrollToTrailers = () => {
    document.getElementById('trailers')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      
      {/* Hero Section Mejorado */}
      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-600/20 rounded-full backdrop-blur-sm">
                <Film className="h-16 w-16 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              WatchHub
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              La mejor plataforma de streaming para toda la familia. 
              Películas, series y documentales en un solo lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="xl"
                  variant="gradient"
                  icon={<Crown className="h-5 w-5" />}
                  className="min-w-[200px]"
                >
                  Comenzar Gratis
                </Button>
              </Link>
              

              
              <Button
                size="xl"
                variant="ghost"
                icon={<Play className="h-5 w-5" />}
                onClick={scrollToTrailers}
                className="min-w-[200px]"
              >
                Ver Trailers
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section Mejorado */}
      <div className="py-16 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Por qué elegir WatchHub?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Descubre todas las ventajas que te ofrecemos para una experiencia de streaming única
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated" className="text-center group hover:border-red-500/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                  <Film className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Contenido Exclusivo
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Accede a miles de películas, series y documentales exclusivos de la mejor calidad.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="elevated" className="text-center group hover:border-red-500/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Perfiles Familiares
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Hasta 5 perfiles por cuenta con recomendaciones personalizadas para cada miembro.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="elevated" className="text-center group hover:border-red-500/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Calidad Premium
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Streaming en 4K con audio de alta calidad y sin interrupciones publicitarias.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trailers Section Mejorado */}
      <div id="trailers" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trailers Destacados
            </h2>
            <p className="text-gray-400 text-lg">
              Descubre las mejores películas y series del momento
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="error"
              title="Error al cargar contenido"
              description={error}
              dismissible
              onDismiss={() => setError('')}
              className="mb-8"
              icon={<AlertCircle className="h-4 w-4" />}
            />
          )}
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner 
                size="lg" 
                text="Cargando trailers increíbles..." 
                className="mb-4"
              />
            </div>
          ) : trailers.length === 0 ? (
            <Card variant="outline" className="text-center py-16">
              <CardContent>
                <Film className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No hay trailers disponibles
                </h3>
                <p className="text-gray-400 mb-6">
                  No se encontraron trailers en este momento. Inténtalo más tarde.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setLoading(true)
                    fetchTrailers()
                  }}
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trailers.map((trailer) => (
                <TrailerCard key={trailer.id} titulo={trailer} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section Mejorado */}
      <div className="py-16 bg-gradient-to-r from-red-600/10 via-purple-600/10 to-red-600/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Card variant="glass" className="p-12 border-red-500/20">
            <CardContent className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para comenzar tu aventura?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Únete a millones de usuarios que ya disfrutan de la mejor experiencia de streaming
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button
                    size="xl"
                    variant="gradient"
                    icon={<ArrowRight className="h-5 w-5" />}
                    iconPosition="right"
                    className="min-w-[200px]"
                  >
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="xl"
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Mejorado */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Film className="h-8 w-8 text-red-500" />
                <span className="text-2xl font-bold text-white">WatchHub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                La plataforma de streaming que conecta a las familias con el mejor entretenimiento.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contenido</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Películas</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Series</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentales</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Infantil</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Términos de Uso</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Carreras</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Prensa</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Inversores</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 WatchHub. Todos los derechos reservados. | Hecho con ❤️ para los amantes del cine
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}