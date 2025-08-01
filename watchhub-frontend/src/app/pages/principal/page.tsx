'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, User, Play, Plus, Settings, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function PrincipalPage() {
  const { user, loading, signOut } = useAuth()
  const [titles, setTitles] = useState<any[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Obtener el perfil seleccionado
    const profileId = localStorage.getItem('selectedProfile')
    if (!profileId) {
      // RUTA CORREGIDA: Redirigir al dashboard en la nueva ubicación
      router.push('/pages/dashboard-user')
      return
    }
    setSelectedProfile(profileId)
    
    if (user) {
      fetchTitles()
    }
  }, [user, router])

  const fetchTitles = async () => {
    try {
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .eq('visible', true)
        .limit(20)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      setTitles(data || [])
    } catch (error) {
      console.error('Error fetching titles:', error)
    }
  }

  const handleSignOut = async () => {
    localStorage.removeItem('selectedProfile')
    await signOut()
    router.push('/')
  }

  const handleBackToProfiles = () => {
    localStorage.removeItem('selectedProfile')
    // RUTA CORREGIDA: Redirigir al dashboard en la nueva ubicación
    router.push('/pages/dashboard-user')
  }

  if (loading) {
    return (
      <div className="min-h-screen hero-section flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user || !selectedProfile) {
    return null
  }

  return (
    <div className="min-h-screen hero-section">
      {/* Header */}
      <header className="glass-card border-0 border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold gradient-text">WatchHub</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-foreground hover:text-primary transition-colors">Inicio</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Películas</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Series</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Mi Lista</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleBackToProfiles}
                className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:block">Cambiar Perfil</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="btn-ghost hover-lift"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            Bienvenido a tu contenido
          </h2>
          <p className="text-xl text-muted-foreground">
            Descubre miles de películas y series
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Trending Now */}
          <section>
            <h3 className="text-2xl font-bold text-foreground mb-6">Tendencias ahora</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {titles.slice(0, 6).map((title) => (
                <div
                  key={title.id}
                  className="streaming-card cursor-pointer hover-lift"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={title.url_poster || 'https://via.placeholder.com/300x400'}
                      alt={title.nombre}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h4 className="font-semibold line-clamp-1">{title.nombre}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{title.tipo}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-accent" />
                        <span className="text-sm text-muted-foreground">
                          {title.clasificacion_edad || 'TP'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Continue Watching */}
          <section>
            <h3 className="text-2xl font-bold text-foreground mb-6">Continuar viendo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {titles.slice(6, 9).map((title) => (
                <div
                  key={title.id}
                  className="streaming-card cursor-pointer hover-lift"
                >
                  <div className="flex space-x-4">
                    <div className="relative overflow-hidden rounded-lg w-32 flex-shrink-0">
                      <img
                        src={title.url_poster || 'https://via.placeholder.com/300x400'}
                        alt={title.nombre}
                        className="w-full aspect-[3/4] object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold line-clamp-2">{title.nombre}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {title.descripcion || 'Descripción no disponible'}
                      </p>
                      <div className="bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-full w-1/3"></div>
                      </div>
                      <p className="text-xs text-muted-foreground">32 min restantes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Content */}
          <section>
            <h3 className="text-2xl font-bold text-foreground mb-6">Todo el contenido</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {titles.map((title) => (
                <div
                  key={title.id}
                  className="streaming-card cursor-pointer hover-lift"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={title.url_poster || 'https://via.placeholder.com/300x400'}
                      alt={title.nombre}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h4 className="font-semibold line-clamp-1">{title.nombre}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{title.tipo}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-accent" />
                        <span className="text-sm text-muted-foreground">
                          {title.clasificacion_edad || 'TP'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}