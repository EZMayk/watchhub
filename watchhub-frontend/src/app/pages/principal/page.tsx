'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, User, Play, Search, Film, Info } from 'lucide-react'
import SubscriptionProtectedRoute from '@/components/SubscriptionProtectedRoute'

function PrincipalContent() {
  const { user, loading, signOut } = useAuth()
  const [titles, setTitles] = useState<any[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
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
        .limit(50)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/70">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || !selectedProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header estilo Netflix */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Film className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-white">WatchHub</h1>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-white hover:text-gray-300 transition-colors">Inicio</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Películas</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Series</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Mi Lista</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
                
                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-black/95 border border-gray-700 rounded-md p-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Títulos, personas, géneros"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder:text-gray-400 focus:outline-none focus:border-white"
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              {/* Profile */}
              <button
                onClick={handleBackToProfiles}
                className="p-2 hover:bg-gray-800 rounded-md transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              
              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-800 rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        {titles.length > 0 && (
          <div className="relative h-screen bg-cover bg-center" style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url(${titles[0].url_poster || 'https://via.placeholder.com/1920x1080'})`
          }}>
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-bold mb-4">{titles[0].nombre}</h1>
                  <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                    {titles[0].descripcion || 'Descubre el contenido más emocionante en WatchHub'}
                  </p>
                  
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded hover:bg-gray-200 transition-colors font-semibold">
                      <Play className="h-5 w-5" />
                      <span>Reproducir</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-gray-600/70 text-white px-8 py-3 rounded hover:bg-gray-600 transition-colors font-semibold">
                      <Info className="h-5 w-5" />
                      <span>Más información</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="bg-black">
          {/* Tendencias */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Tendencias ahora</h2>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Ver todo
                </button>
              </div>
              
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {titles.slice(0, 10).map((title) => (
                  <div
                    key={title.id}
                    className="flex-none w-48 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        src={title.url_poster || 'https://via.placeholder.com/300x400'}
                        alt={title.nombre}
                        className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors">
                          <Play className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="font-medium text-sm line-clamp-1">{title.nombre}</h3>
                      <p className="text-gray-400 text-sm">{title.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Películas */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Películas populares</h2>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Ver todo
                </button>
              </div>
              
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {titles.filter(t => t.tipo === 'Película').slice(0, 10).map((title) => (
                  <div
                    key={title.id}
                    className="flex-none w-48 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        src={title.url_poster || 'https://via.placeholder.com/300x400'}
                        alt={title.nombre}
                        className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors">
                          <Play className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="font-medium text-sm line-clamp-1">{title.nombre}</h3>
                      <p className="text-gray-400 text-sm">{title.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Series */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Series recomendadas</h2>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Ver todo
                </button>
              </div>
              
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {titles.filter(t => t.tipo === 'Serie').slice(0, 10).map((title) => (
                  <div
                    key={title.id}
                    className="flex-none w-48 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        src={title.url_poster || 'https://via.placeholder.com/300x400'}
                        alt={title.nombre}
                        className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors">
                          <Play className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="font-medium text-sm line-clamp-1">{title.nombre}</h3>
                      <p className="text-gray-400 text-sm">{title.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Catálogo completo */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Catálogo completo</h2>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {titles.map((title) => (
                  <div
                    key={title.id}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        src={title.url_poster || 'https://via.placeholder.com/300x400'}
                        alt={title.nombre}
                        className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="font-medium text-sm line-clamp-1">{title.nombre}</h3>
                      <p className="text-gray-400 text-xs">{title.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default function PrincipalPage() {
  return (
    <SubscriptionProtectedRoute>
      <PrincipalContent />
    </SubscriptionProtectedRoute>
  )
}