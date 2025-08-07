'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Play, ArrowRight, Film, Users, Crown, AlertCircle, Wrench } from 'lucide-react'
import { Button, Card, CardContent, LoadingSpinner, Alert } from '@/components/ui'
import TrailerCard from '@/components/TrailerCard'
import LandingNavbar from '@/components/LandingNavbar'
import { useAppSettings } from '@/hooks/useAppSettings'

// Definir el tipo para los trailers basado en la estructura real de la base de datos
interface Trailer {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  categoria: string
  año: number
  duracion: string
  director: string
  actores: string
  genero: string
  edad_minima: number
  url_video: string
  imagen_portada: string
  visible: boolean
  created_at: string
  updated_at: string
}

export default function HomePage() {
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Obtener configuración dinámica
  const { settings, loading: settingsLoading, error: settingsError } = useAppSettings()

  // Actualizar título de la página cuando cambie la configuración
  useEffect(() => {
    document.title = `${settings.site_name} - Streaming de Películas y Series`
  }, [settings.site_name])

  const fetchTrailers = useCallback(async () => {
    try {
      setError('')
      console.log('🔄 Cargando títulos desde la base de datos...');
      
      // Primero obtenemos los trailers destacados configurados por el admin
      const { data: settingsData, error: settingsError } = await supabase
        .from('app_settings')
        .select('featured_trailers, max_homepage_trailers')
        .limit(1)
        .single();

      let trailersData: Trailer[] | null, trailersError: any;

      if (settingsError) {
        console.warn('⚠️ No se pudo cargar configuración de trailers destacados:', settingsError);
        // Si no hay configuración, mostrar los más recientes como fallback
        const fallbackResult = await supabase
          .from('titulos')
          .select('*')
          .eq('visible', true)
          .limit(6)
          .order('created_at', { ascending: false });
        
        trailersData = fallbackResult.data;
        trailersError = fallbackResult.error;
      } else {
        const { featured_trailers, max_homepage_trailers } = settingsData;
        
        if (featured_trailers && featured_trailers.length > 0) {
          console.log(`🎯 Cargando ${featured_trailers.length} trailers destacados seleccionados por el admin`);
          
          // Cargar los trailers destacados específicos
          const featuredResult = await supabase
            .from('titulos')
            .select('*')
            .in('id', featured_trailers)
            .eq('visible', true);
          
          trailersData = featuredResult.data;
          trailersError = featuredResult.error;
          
          // Ordenar según el orden definido por el admin
          if (trailersData) {
            trailersData = featured_trailers
              .map((id: string) => trailersData?.find((trailer: Trailer) => trailer.id === id))
              .filter(Boolean);
          }
        } else {
          console.log('📋 No hay trailers destacados configurados, mostrando los más recientes');
          
          // Fallback: mostrar los más recientes
          const recentResult = await supabase
            .from('titulos')
            .select('*')
            .eq('visible', true)
            .limit(max_homepage_trailers || 6)
            .order('created_at', { ascending: false });
          
          trailersData = recentResult.data;
          trailersError = recentResult.error;
        }
      }

      console.log('📊 Respuesta de la consulta:', { data: trailersData, error: trailersError });

      if (trailersError) {
        console.error('❌ Error en la consulta:', trailersError);
        throw trailersError;
      }
      
      console.log(`✅ Se encontraron ${trailersData?.length || 0} títulos`);
      setTrailers(trailersData || [])
    } catch (error) {
      console.error('Error fetching trailers:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los títulos. Por favor, intenta de nuevo.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    
    const loadTrailers = async () => {
      if (isMounted) {
        await fetchTrailers()
      }
    }
    
    loadTrailers()
    
    return () => {
      isMounted = false
    }
  }, [fetchTrailers]) // Ahora fetchTrailers es estable gracias a useCallback

  const scrollToTrailers = useCallback(() => {
    const trailersElement = document.getElementById('trailers')
    if (trailersElement) {
      trailersElement.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleRetry = useCallback(() => {
    setLoading(true)
    setError('')
    fetchTrailers()
  }, [fetchTrailers])

  // Si el modo mantenimiento está activo, mostrar página de mantenimiento
  if (settings.maintenance_mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-yellow-600/20 rounded-full backdrop-blur-sm">
              <Wrench className="h-16 w-16 text-yellow-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {settings.site_name}
          </h1>
          
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
            Sitio en Mantenimiento
          </h2>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            Estamos realizando mejoras para ofrecerte una mejor experiencia. 
            Volveremos pronto con nuevas funcionalidades.
          </p>
          
          <div className="animate-pulse">
            <div className="h-2 bg-yellow-600 rounded-full mb-2"></div>
            <p className="text-sm text-gray-400">Trabajando en las mejoras...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <LandingNavbar />
      
      {/* Notificación de error de configuración */}
      {settingsError && (
        <div className="bg-yellow-900/90 border-b border-yellow-700 p-3">
          <div className="container mx-auto">
            <Alert
              variant="warning"
              title="Configuración no disponible"
              description="Se está usando la configuración por defecto. Algunas funciones pueden estar limitadas."
              className="border-yellow-600 bg-yellow-900/50"
            />
          </div>
        </div>
      )}
      
      {/* Hero Section Mejorado */}
      <header className="hero-section relative overflow-hidden" aria-labelledby="main-heading">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20"></div>
        
        <div className="container-hero relative py-24">
          <div className="text-center animate-fadeInUp">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-600/20 rounded-full backdrop-blur-sm animate-float">
                <Film className="h-16 w-16 text-red-500" />
              </div>
            </div>
            
            <h1 id="main-heading" className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
              {settings.site_name}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {settings.site_description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {settings.registration_enabled ? (
                <Link href="/auth/register">
                  <Button
                    size="xl"
                    variant="gradient"
                    icon={<Crown className="h-5 w-5" />}
                    className="min-w-[200px] hover-lift"
                  >
                    Comenzar Gratis
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button
                    size="xl"
                    variant="gradient"
                    icon={<Crown className="h-5 w-5" />}
                    className="min-w-[200px] hover-lift"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
              
              <Button
                size="xl"
                variant="ghost"
                icon={<Play className="h-5 w-5" />}
                onClick={scrollToTrailers}
                className="min-w-[200px] hover-lift"
              >
                Ver Trailers
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section Mejorado */}
      <section className="section-padding bg-gray-800/50 backdrop-blur-sm" aria-labelledby="features-title">
        <div className="container-responsive">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 id="features-title" className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Por qué elegir WatchHub?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Descubre todas las ventajas que te ofrecemos para una experiencia de streaming única
            </p>
          </div>
          
          <div className="grid-features">
            <Card variant="elevated" className="text-center group hover:border-red-500/50 transition-all duration-300 hover-lift">
              <CardContent className="p-8">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                  <Film className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Contenido Exclusivo
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Accede a miles de películas, series y documentales exclusivos de la mejor calidad.
                  {settings.content_moderation && " Todo nuestro contenido es revisado y moderado."}
                </p>
              </CardContent>
            </Card>
            
            <Card variant="elevated" className="text-center group hover:border-red-500/50 transition-all duration-300 hover-lift">
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
            
            <Card variant="elevated" className="text-center group hover:border-red-500/50 transition-all duration-300 hover-lift">
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
      </section>

      {/* Trailers Section Mejorado */}
      <section id="trailers" className="section-padding" aria-labelledby="trailers-title">
        <div className="container-responsive">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 id="trailers-title" className="text-3xl md:text-4xl font-bold text-white mb-4">
              Contenido Destacado
            </h2>
            <p className="text-gray-400 text-lg">
              Los mejores títulos seleccionados especialmente para ti
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
          
          {/* Estados de carga y contenido */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner 
                size="lg" 
                text="Cargando trailers increíbles..." 
                className="mb-4 loading-shimmer"
              />
            </div>
          )}
          
          {!loading && trailers.length === 0 && (
            <Card variant="outline" className="text-center py-16 hover-lift">
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
                  onClick={handleRetry}
                  className="hover-lift"
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          )}
          
          {!loading && trailers.length > 0 && (
            <>
              <div className="grid-responsive">
                {trailers.map((trailer) => (
                  <div key={trailer.id} className="hover-lift">
                    <TrailerCard titulo={trailer} />
                  </div>
                ))}
              </div>
              
              {/* Indicador de contenido destacado */}
              <div className="text-center mt-8">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Contenido seleccionado por nuestro equipo
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section Mejorado */}
      <section className="section-padding bg-gradient-to-r from-red-600/10 via-purple-600/10 to-red-600/10">
        <div className="max-w-4xl mx-auto text-center container-responsive">
          <Card variant="glass" className="p-12 border-red-500/20 hover-glow">
            <CardContent className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-gradient">
                ¿Listo para comenzar tu aventura?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Únete a millones de usuarios que ya disfrutan de la mejor experiencia de streaming
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {settings.registration_enabled ? (
                  <>
                    <Link href="/auth/register">
                      <Button
                        size="xl"
                        variant="gradient"
                        icon={<ArrowRight className="h-5 w-5" />}
                        iconPosition="right"
                        className="min-w-[200px] hover-lift"
                      >
                        Comenzar Ahora
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button
                        size="xl"
                        variant="outline"
                        className="min-w-[200px] hover-lift"
                      >
                        Ya tengo cuenta
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/auth/login">
                    <Button
                      size="xl"
                      variant="gradient"
                      icon={<ArrowRight className="h-5 w-5" />}
                      iconPosition="right"
                      className="min-w-[200px] hover-lift"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Mejorado */}
      <footer className="bg-gray-900 border-t border-gray-800 section-padding" role="contentinfo" aria-label="Información de la empresa y enlaces de navegación">
        <div className="container-responsive">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="animate-fadeInUp">
              <div className="flex items-center space-x-2 mb-4 hover-lift">
                <Film className="h-8 w-8 text-red-500" aria-hidden="true" />
                <span className="text-2xl font-bold text-white text-gradient">{settings.site_name}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {settings.site_description}
              </p>
            </div>
            
            <nav className="animate-fadeInUp" aria-labelledby="content-nav">
              <h4 id="content-nav" className="text-white font-semibold mb-4">Contenido</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Películas</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Series</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Documentales</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Infantil</Link></li>
              </ul>
            </nav>
            
            <nav className="animate-fadeInUp" aria-labelledby="support-nav">
              <h4 id="support-nav" className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Centro de Ayuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Contacto</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Términos de Uso</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Privacidad</Link></li>
              </ul>
            </nav>
            
            <nav className="animate-fadeInUp" aria-labelledby="company-nav">
              <h4 id="company-nav" className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Carreras</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Prensa</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors hover-lift">Inversores</Link></li>
              </ul>
            </nav>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 {settings.site_name}. Todos los derechos reservados. | Hecho con ❤️ para los amantes del cine
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}