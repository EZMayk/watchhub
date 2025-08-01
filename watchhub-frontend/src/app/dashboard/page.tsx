'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, User, Play, Plus, Settings, Star } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const [titles, setTitles] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchTitles()
    }
  }, [user])

  const fetchUserData = async () => {
    // Aquí puedes agregar lógica para obtener datos adicionales del usuario
    setUserProfile({
      subscription: 'Premium',
      profilesCount: 3
    })
  }

  const fetchTitles = async () => {
    try {
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .eq('visible', true)
        .limit(12)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      setTitles(data || [])
    } catch (error) {
      console.error('Error fetching titles:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando tu dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-red-500">WatchHub</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-white hover:text-red-500">Inicio</a>
                <a href="#" className="text-gray-400 hover:text-white">Películas</a>
                <a href="#" className="text-gray-400 hover:text-white">Series</a>
                <a href="#" className="text-gray-400 hover:text-white">Mi Lista</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <Settings className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm">
                  {user.user_metadata?.first_name || user.email?.split('@')[0]}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:block">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            ¡Bienvenido de vuelta, {user.user_metadata?.first_name || 'Usuario'}!
          </h2>
          <p className="text-gray-400">
            Continúa viendo donde te quedaste o descubre algo nuevo
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tu Cuenta</h3>
                <p className="text-gray-400">Plan {userProfile?.subscription || 'Básico'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Perfiles</h3>
                <p className="text-gray-400">{userProfile?.profilesCount || 1} de 5 activos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Estado</h3>
                <p className="text-gray-400">
                  {user.email_confirmed_at ? 'Verificado' : 'Pendiente verificación'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Contenido Destacado</h3>
            <button className="text-red-500 hover:text-red-400">Ver todo</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {titles.map((title) => (
              <div
                key={title.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={title.url_poster || 'https://via.placeholder.com/300x200'}
                    alt={title.nombre}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className="text-sm font-semibold truncate">{title.nombre}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{title.tipo}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-gray-400">
                        {title.clasificacion_edad || 'TP'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-red-600 hover:bg-red-700 p-4 rounded-lg text-left transition-colors">
              <Plus className="h-6 w-6 mb-2" />
              <h4 className="font-semibold">Crear Perfil</h4>
              <p className="text-sm text-gray-300">Añade un nuevo perfil familiar</p>
            </button>
            
            <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-left transition-colors">
              <Settings className="h-6 w-6 mb-2" />
              <h4 className="font-semibold">Configurar Cuenta</h4>
              <p className="text-sm text-gray-300">Gestiona tu suscripción y preferencias</p>
            </button>
            
            <button className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-left transition-colors">
              <Star className="h-6 w-6 mb-2" />
              <h4 className="font-semibold">Mi Lista</h4>
              <p className="text-sm text-gray-300">Ver tus favoritos y pendientes</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}