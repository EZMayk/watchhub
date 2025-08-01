'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, User, Play, Plus, Settings, Star, Search, ChevronLeft, ChevronRight, Crown, Bookmark, Clock, TrendingUp, Film, Tv } from 'lucide-react'

export default function PrincipalPage() {
  const { user, loading, signOut } = useAuth()
  const [titles, setTitles] = useState<any[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('inicio')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const profileId = localStorage.getItem('selectedProfile')
    if (!profileId) {
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
        .limit(24)
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
    router.push('/pages/dashboard-user')
  }

  const navigationItems = [
    { id: 'inicio', label: 'Inicio', icon: Film },
    { id: 'peliculas', label: 'Películas', icon: Film },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'milista', label: 'Mi Lista', icon: Bookmark },
  ]

  if (loading) {
    return (
      <div className="min-h-screen hero-section flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner w-12 h-12"></div>
          <p className="text-muted-foreground animate-pulse">Preparando tu experiencia...</p>
        </div>
      </div>
    )
  }

  if (!user || !selectedProfile) {
    return null
  }

  return (
    <div className="min-h-screen hero-section">
      {/* Header premium */}
      <header className="glass-card border-0 border-b border-border/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <Film className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">WatchHub</h1>
                  <p className="text-xs text-muted-foreground">Premium Experience</p>
                </div>
              </div>
              
              <nav className="hidden lg:flex space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 relative group ${
                        activeSection === item.id
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                      {activeSection === item.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Búsqueda */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
                
                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 w-80 glass-card p-4 rounded-xl animate-scaleIn">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar películas, series..."
                      className="w-full px-4 py-3 bg-input/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              {/* Premium badge */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Premium</span>
              </div>
              
              {/* Cambiar perfil */}
              <button
                onClick={handleBackToProfiles}
                className="flex items-center space-x-2 bg-secondary/50 hover:bg-secondary px-4 py-2 rounded-xl transition-all hover-lift"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:block font-medium">Perfil</span>
              </button>
              
              {/* Salir */}
              <button
                onClick={handleSignOut}
                className="btn-ghost hover-lift relative group p-3"
              >
                <LogOut className="h-4 w-4" />
                <div className="absolute inset-0 bg-destructive/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-8 md:p-12">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center space-x-2 bg-primary/20 px-4 py-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Tendencia #1</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 gradient-text">
              Tu mundo de entretenimiento
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Descubre miles de películas, series y documentales seleccionados especialmente para ti
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl hover-lift">
                <Play className="h-5 w-5 mr-2" />
                Explorar Ahora
              </button>
              <button className="btn-ghost px-8 py-4 text-lg font-semibold rounded-xl hover-lift">
                <Plus className="h-5 w-5 mr-2" />
                Mi Lista
              </button>
            </div>
          </div>
          
          {/* Efectos de fondo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* Trending Now */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground">Tendencias</h3>
                  <p className="text-muted-foreground">Lo más popular ahora</p>
                </div>
              </div>
              <button className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
                <span className="font-semibold">Ver todo</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {titles.slice(0, 6).map((title, index) => (
                <div
                  key={title.id}
                  className="streaming-card cursor-pointer hover-lift group animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={title.url_poster || 'https://via.placeholder.com/300x400'}
                      alt={title.nombre}
                      className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay con efectos */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Play className="h-8 w-8 text-white bg-primary/80 rounded-full p-2" />
                            <Plus className="h-8 w-8 text-white bg-secondary/80 rounded-full p-2" />
                          </div>
                          <div className="flex items-center space-x-1 bg-black/50 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 text-accent" />
                            <span className="text-xs text-white font-semibold">
                              {title.clasificacion_edad || 'TP'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {title.nombre}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground bg-secondary/30 px-2 py-1 rounded-full">
                        {title.tipo}
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                        <span className="text-xs text-accent font-semibold">NUEVO</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Continue Watching */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-accent/20 rounded-xl">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground">Continuar viendo</h3>
                  <p className="text-muted-foreground">Retoma donde lo dejaste</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {titles.slice(6, 9).map((title, index) => (
                <div
                  key={title.id}
                  className="streaming-card cursor-pointer hover-lift group animate-slideInLeft"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex space-x-4 p-4">
                    <div className="relative overflow-hidden rounded-lg w-24 flex-shrink-0">
                      <img
                        src={title.url_poster || 'https://via.placeholder.com/300x400'}
                        alt={title.nombre}
                        className="w-full aspect-[3/4] object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {title.nombre}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {title.descripcion || 'Descripción no disponible'}
                      </p>
                      
                      {/* Barra de progreso */}
                      <div className="space-y-2">
                        <div className="bg-muted rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-primary to-accent h-full w-1/3 rounded-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center justify-between">
                          <span>32 min restantes</span>
                          <span className="text-primary font-semibold">67% completado</span>
                        </p>
                      </div>
                      
                      <button className="flex items-center space-x-2 text-primary hover:text-accent transition-colors">
                        <Play className="h-4 w-4" />
                        <span className="text-sm font-semibold">Continuar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Content */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground">Catálogo completo</h3>
                  <p className="text-muted-foreground">Explora toda nuestra colección</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {titles.map((title, index) => (
                <div
                  key={title.id}
                  className="streaming-card cursor-pointer hover-lift group animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={title.url_poster || 'https://via.placeholder.com/300x400'}
                      alt={title.nombre}
                      className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <button className="p-2 bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform">
                            <Play className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-secondary/80 text-foreground rounded-full hover:scale-110 transition-transform">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {title.nombre}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground bg-secondary/30 px-2 py-1 rounded-full">
                        {title.tipo}
                      </span>
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