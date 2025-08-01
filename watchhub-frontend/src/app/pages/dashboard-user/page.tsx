'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, Plus, Settings, User, Film } from 'lucide-react'

interface Profile {
  id: string
  name: string
  avatar_url?: string
  is_kids: boolean
  color: string
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [isKidsProfile, setIsKidsProfile] = useState(false)
  const router = useRouter()

  // Colores disponibles para perfiles
  const profileColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ]

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user])

  const fetchProfiles = async () => {
    try {
      // Simular perfiles - aquí conectarías con tu base de datos
      const mockProfiles: Profile[] = [
        {
          id: '1',
          name: user?.user_metadata?.first_name || 'Usuario Principal',
          avatar_url: '',
          is_kids: false,
          color: 'bg-red-500'
        },
        {
          id: '2',
          name: 'Niños',
          avatar_url: '',
          is_kids: true,
          color: 'bg-green-500'
        }
      ]
      setProfiles(mockProfiles)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleProfileSelect = (profileId: string) => {
    // Guardar el perfil seleccionado en localStorage o estado global
    localStorage.setItem('selectedProfile', profileId)
    // Redirigir al panel principal de películas (NUEVA RUTA CORREGIDA)
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
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen hero-section">
      {/* Header con logo y botón de salir */}
      <header className="glass-card border-0 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Film className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">WatchHub</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="btn-ghost flex items-center space-x-2 hover-lift"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sección principal de perfiles */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center">
          {/* Título */}
          <div className="mb-12 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              ¿Quién va a ver hoy?
            </h1>
            <p className="text-xl text-muted-foreground">
              Selecciona tu perfil para continuar
            </p>
          </div>

          {/* Grid de perfiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-12">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className="flex flex-col items-center space-y-4 cursor-pointer group animate-scaleIn hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleProfileSelect(profile.id)}
              >
                {/* Avatar del perfil */}
                <div className={`
                  w-24 h-24 md:w-32 md:h-32 rounded-lg ${profile.color} 
                  flex items-center justify-center text-white text-2xl md:text-3xl font-bold
                  transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow
                  border-2 border-transparent group-hover:border-primary
                  relative
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
                  
                  {/* Indicador de perfil infantil */}
                  {profile.is_kids && (
                    <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-semibold">
                      KIDS
                    </div>
                  )}
                </div>

                {/* Nombre del perfil */}
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {profile.name}
                  </h3>
                  {profile.is_kids && (
                    <p className="text-sm text-muted-foreground">Perfil Infantil</p>
                  )}
                </div>
              </div>
            ))}

            {/* Botón para crear nuevo perfil */}
            {profiles.length < 5 && (
              <div
                className="flex flex-col items-center space-y-4 cursor-pointer group animate-scaleIn hover-lift"
                style={{ animationDelay: `${profiles.length * 0.1}s` }}
                onClick={() => setShowCreateProfile(true)}
              >
                {/* Icono de añadir */}
                <div className="
                  w-24 h-24 md:w-32 md:h-32 rounded-lg bg-muted 
                  flex items-center justify-center text-muted-foreground
                  transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground
                  border-2 border-dashed border-muted-foreground group-hover:border-primary
                ">
                  <Plus className="w-8 h-8 md:w-10 md:h-10" />
                </div>

                {/* Texto */}
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    Añadir Perfil
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Hasta {5 - profiles.length} más
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="text-center text-muted-foreground animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm">
              Gestiona perfiles desde{' '}
              <button className="text-primary hover:text-primary/80 underline">
                Configuración de Cuenta
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Modal para crear perfil */}
      {showCreateProfile && (
        <div className="modal-overlay" onClick={() => setShowCreateProfile(false)}>
          <div className="modal-premium max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Crear Nuevo Perfil</h2>
              
              <div className="space-y-4">
                {/* Nombre del perfil */}
                <div className="input-premium">
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Nombre del perfil"
                    className="w-full"
                    maxLength={20}
                  />
                  <label>Nombre del perfil</label>
                </div>

                {/* Opción perfil infantil */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="kids-profile"
                    checked={isKidsProfile}
                    onChange={(e) => setIsKidsProfile(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="kids-profile" className="text-foreground">
                    Perfil Infantil (solo contenido apropiado para niños)
                  </label>
                </div>

                {/* Vista previa del avatar */}
                <div className="text-center">
                  <div className={`
                    w-20 h-20 mx-auto rounded-lg ${profileColors[profiles.length % profileColors.length]}
                    flex items-center justify-center text-white text-xl font-bold
                  `}>
                    {newProfileName.charAt(0).toUpperCase() || '?'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Vista previa del avatar</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowCreateProfile(false)}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}