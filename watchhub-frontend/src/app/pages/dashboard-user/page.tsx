'use client'
import { Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, Plus, Settings, User, Film, Crown, Shield } from 'lucide-react'
import { Button, Card, CardContent, Avatar, Badge, Modal, Input, Alert } from '@/components/ui'
import Navbar from '../../../components/Navbar'

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

  // Colores disponibles para perfiles
  const profileColors = [
    'bg-gradient-to-br from-red-500 to-red-700', 
    'bg-gradient-to-br from-blue-500 to-blue-700', 
    'bg-gradient-to-br from-green-500 to-green-700', 
    'bg-gradient-to-br from-yellow-500 to-yellow-700',
    'bg-gradient-to-br from-purple-500 to-purple-700', 
    'bg-gradient-to-br from-pink-500 to-pink-700', 
    'bg-gradient-to-br from-indigo-500 to-indigo-700', 
    'bg-gradient-to-br from-orange-500 to-orange-700'
  ]

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user])

  const fetchProfiles = async () => {
    try {
      const mockProfiles: Profile[] = [
        {
          id: '1',
          name: user?.user_metadata?.first_name || 'Usuario Principal',
          avatar_url: '',
          is_kids: false,
          color: 'bg-gradient-to-br from-red-500 to-red-700'
        },
        {
          id: '2',
          name: 'Niños',
          avatar_url: '',
          is_kids: true,
          color: 'bg-gradient-to-br from-green-500 to-green-700'
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
    <div className="min-h-screen hero-section relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Header premium */}
      <header className="glass-card border-0 border-b border-border/30 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Film className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">WatchHub</h1>
                <p className="text-sm text-muted-foreground">Premium Streaming</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-secondary/50 rounded-lg backdrop-blur-sm">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Premium</span>
              </div>
              <button
                onClick={handleSignOut}
                className="btn-ghost flex items-center space-x-2 hover-lift relative group"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
                <div className="absolute inset-0 bg-destructive/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sección principal de perfiles */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="max-w-6xl w-full text-center">
          {/* Título cinematográfico */}
          <div className="mb-16 animate-fadeInUp">
            <div className="inline-block">
              <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 relative">
                ¿Quién va a ver hoy?
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent blur-lg opacity-30 animate-glow"></div>
              </h1>
            </div>
            <p className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              Selecciona tu perfil para acceder a tu mundo de entretenimiento personalizado
            </p>
          </div>

          {/* Grid de perfiles mejorado */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-16">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className="flex flex-col items-center space-y-6 cursor-pointer group animate-scaleIn hover-lift"
                style={{ animationDelay: `${index * 0.15}s` }}
                onClick={() => handleProfileSelect(profile.id)}
              >
                {/* Avatar del perfil premium */}
                <div className="relative">
                  <div className={`
                    w-28 h-28 md:w-36 md:h-36 rounded-2xl ${profile.color} 
                    flex items-center justify-center text-white text-3xl md:text-4xl font-black
                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                    border-4 border-transparent group-hover:border-primary/50
                    shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/25
                    relative overflow-hidden
                  `}>
                    {/* Efecto shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="select-none relative z-10">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )
                    }
                  </div>
                  
                  {/* Indicador de perfil infantil mejorado */}
                  {profile.is_kids && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-glow flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>KIDS</span>
                    </div>
                  )}

                  {/* Anillo de hover */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin-slow"></div>
                  <div className="absolute -inset-1 bg-background rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Nombre del perfil mejorado */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {profile.name}
                  </h3>
                  {profile.is_kids && (
                    <p className="text-sm text-green-400 font-semibold flex items-center justify-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Perfil Protegido</span>
                    </p>
                  )}
                  <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-500 mx-auto"></div>
                </div>
              </div>
            ))}

            {/* Botón para crear nuevo perfil mejorado */}
            {profiles.length < 5 && (
              <div
                className="flex flex-col items-center space-y-6 cursor-pointer group animate-scaleIn hover-lift"
                style={{ animationDelay: `${profiles.length * 0.15}s` }}
                onClick={() => setShowCreateProfile(true)}
              >
                {/* Icono de añadir premium */}
                <div className="relative">
                  <div className="
                    w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-muted to-muted/50
                    flex items-center justify-center text-muted-foreground
                    transition-all duration-500 group-hover:scale-110 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground
                    border-4 border-dashed border-muted-foreground/30 group-hover:border-primary group-hover:border-solid
                    shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/25
                    relative overflow-hidden
                  ">
                    <Plus className="w-12 h-12 md:w-16 md:h-16 transition-transform duration-300 group-hover:rotate-90" />
                    
                    {/* Efecto de pulso */}
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  </div>
                </div>

                {/* Texto mejorado */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    Añadir Perfil
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors">
                    Hasta {5 - profiles.length} perfiles más
                  </p>
                  <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-500 mx-auto"></div>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional mejorada */}
          <div className="text-center animate-fadeInUp space-y-4" style={{ animationDelay: '0.8s' }}>
            <div className="glass-card inline-block px-6 py-3 backdrop-blur-sm">
              <p className="text-muted-foreground">
                Gestiona perfiles desde{' '}
                <button className="text-primary hover:text-accent underline decoration-primary/50 hover:decoration-accent transition-colors font-semibold">
                  Configuración de Cuenta
                </button>
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-accent" />
                <span>Experiencia Premium</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Perfiles Seguros</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para crear perfil mejorado */}
      {showCreateProfile && (
        <div className="modal-overlay backdrop-blur-md" onClick={() => setShowCreateProfile(false)}>
          <div className="modal-premium max-w-lg w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Efectos de fondo del modal */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-30 blur"></div>
            
            <div className="relative bg-card border border-border/50 rounded-2xl p-8 backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-primary/20 rounded-xl mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Crear Nuevo Perfil</h2>
                <p className="text-muted-foreground mt-2">Personaliza tu experiencia de streaming</p>
              </div>
              
              <div className="space-y-6">
                {/* Nombre del perfil */}
                <div className="input-premium">
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder=" "
                    className="w-full px-4 py-4 bg-input/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    maxLength={20}
                  />
                  <label className="absolute -top-3 left-4 px-2 text-sm font-medium text-muted-foreground bg-card">
                    Nombre del perfil
                  </label>
                </div>

                {/* Opción perfil infantil mejorada */}
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="kids-profile"
                        checked={isKidsProfile}
                        onChange={(e) => setIsKidsProfile(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                        isKidsProfile 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-border hover:border-primary'
                      }`} onClick={() => setIsKidsProfile(!isKidsProfile)}>
                        {isKidsProfile && <Shield className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label htmlFor="kids-profile" className="text-foreground font-semibold cursor-pointer">
                        Perfil Infantil
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Solo contenido apropiado y seguro para niños
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vista previa del avatar mejorada */}
                <div className="text-center">
                  <div className="inline-block relative">
                    <div className={`
                      w-24 h-24 mx-auto rounded-2xl ${profileColors[profiles.length % profileColors.length]}
                      flex items-center justify-center text-white text-2xl font-bold
                      shadow-xl relative overflow-hidden
                    `}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                      <span className="relative z-10">
                        {newProfileName.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    
                    {isKidsProfile && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>KIDS</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Vista previa del avatar</p>
                </div>
              </div>

              {/* Botones mejorados */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowCreateProfile(false)}
                  className="btn-ghost flex-1 py-4 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                  className="btn-primary flex-1 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10">Crear Perfil</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}