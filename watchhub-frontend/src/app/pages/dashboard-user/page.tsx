'use client'
import { Suspense, useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Plus, Film } from 'lucide-react'
import '@/styles/dashboard-animations.css'
import SubscriptionProtectedRoute from '@/components/SubscriptionProtectedRoute'

interface Profile {
  id: string
  name: string
  avatar_url?: string
  is_kids: boolean
  color: string
}

function DashboardContent() {
  const { user, loading, signOut } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [isKidsProfile, setIsKidsProfile] = useState(false)
  const router = useRouter()

  // Colores disponibles para perfiles con gradientes mejorados
  const profileColors = useMemo(() => [
    'bg-gradient-to-br from-red-500 via-red-600 to-red-700', 
    'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700', 
    'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700', 
    'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700',
    'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700', 
    'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700', 
    'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700', 
    'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700',
    'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700',
    'bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700'
  ], [])

  const fetchProfiles = useCallback(async () => {
    try {
      const mockProfiles: Profile[] = [
        {
          id: '1',
          name: user?.user_metadata?.first_name || 'Usuario Principal',
          avatar_url: '',
          is_kids: false,
          color: profileColors[0]
        },
        {
          id: '2',
          name: 'Niños',
          avatar_url: '',
          is_kids: true,
          color: profileColors[2]
        }
      ]
      setProfiles(mockProfiles)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    }
  }, [user, profileColors])

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user, fetchProfiles])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleProfileSelect = (profileId: string) => {
    localStorage.setItem('selectedProfile', profileId)
    router.push('/pages/principal')
  }

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return

    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newProfileName,
      avatar_url: '',
      is_kids: isKidsProfile,
      color: profileColors[profiles.length % profileColors.length]
    }

    setProfiles([...profiles, newProfile])
    setNewProfileName('')
    setIsKidsProfile(false)
    setShowCreateProfile(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen hero-section flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner w-12 h-12"></div>
          <p className="text-muted-foreground animate-pulse">Cargando tu experiencia...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header simple */}
      <header className="w-full py-6 px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo WatchHub */}
          <div className="flex items-center space-x-3">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              WatchHub
            </h1>
          </div>
          
          {/* Botón salir simple */}
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido principal  */}
      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Título principal */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-normal text-foreground mb-4">
            ¿Quién está viendo?
          </h1>
        </div>

        {/* Grid de perfiles */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className="flex flex-col items-center space-y-3 group cursor-pointer"
              onClick={() => handleProfileSelect(profile.id)}
            >
              {/* Avatar simple */}
              <div className="relative">
                <div className={`
                  w-32 h-32 md:w-40 md:h-40 rounded-lg ${profile.color}
                  flex items-center justify-center text-white text-4xl md:text-5xl font-semibold
                  transition-all duration-200 hover:border-4 hover:border-white
                  group-hover:scale-105
                `}>
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="select-none">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Badge KIDS simple */}
                {profile.is_kids && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">
                    KIDS
                  </div>
                )}
              </div>
              
              {/* Nombre del perfil */}
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                {profile.name}
              </span>
            </button>
          ))}

          {/* Botón agregar perfil simple */}
          {profiles.length < 5 && (
            <button
              className="flex flex-col items-center space-y-3 group cursor-pointer"
              onClick={() => setShowCreateProfile(true)}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center group-hover:scale-105 duration-200">
                <Plus className="w-12 h-12 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                Agregar perfil
              </span>
            </button>
          )}
        </div>

        {/* Gestionar perfiles */}
        <div className="text-center">
          <button className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium border border-muted-foreground hover:border-foreground px-8 py-2 rounded">
            Administrar perfiles
          </button>
        </div>
      </main>

      {/* Modal crear perfil */}
      {showCreateProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Agregar perfil
            </h2>
            
            <div className="space-y-6">
              {/* Nombre del perfil */}
              <div>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Nombre"
                  className="w-full px-4 py-3 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  maxLength={20}
                />
              </div>

              {/* Opción perfil infantil */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="kids-checkbox"
                  checked={isKidsProfile}
                  onChange={(e) => setIsKidsProfile(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="kids-checkbox" className="text-foreground">
                  Este es un perfil para niños
                </label>
              </div>
              
              {/* Vista previa */}
              <div className="text-center">
                <div className={`
                  w-24 h-24 mx-auto rounded-lg ${profileColors[profiles.length % profileColors.length]}
                  flex items-center justify-center text-white text-2xl font-semibold mb-3
                `}>
                  {newProfileName.charAt(0).toUpperCase() || '?'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {newProfileName || 'Nuevo perfil'}
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateProfile(false)}
                className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <SubscriptionProtectedRoute>
      <Suspense fallback={<div>Cargando...</div>}>
        <DashboardContent />
      </Suspense>
    </SubscriptionProtectedRoute>
  )
}