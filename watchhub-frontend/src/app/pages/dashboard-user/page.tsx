'use client'
import { Suspense, useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Settings, User, Film, Crown, Shield, Star, Sparkles } from 'lucide-react'
import '@/styles/dashboard-animations.css'

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
    <div className="min-h-screen hero-section relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Header premium con efectos mejorados */}
      <header className="relative z-50 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl backdrop-blur-sm border border-primary/30">
                  <Film className="h-8 w-8 text-primary drop-shadow-lg" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    WatchHub
                  </h1>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-accent fill-current" />
                    <Sparkles className="h-3 w-3 text-primary fill-current" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Premium Streaming Experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Badge Premium mejorado */}
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl backdrop-blur-sm border border-accent/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Crown className="h-4 w-4 text-accent drop-shadow-sm relative z-10" />
                <span className="text-sm font-bold text-accent relative z-10">Premium</span>
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse relative z-10"></div>
              </div>
              
              {/* Información del usuario */}
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-secondary/50 rounded-xl backdrop-blur-sm border border-border/30">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.user_metadata?.first_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email?.slice(0, 20)}...
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="group relative flex items-center space-x-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-all duration-300 border border-destructive/20 hover:border-destructive/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/30 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <LogOut className="h-4 w-4 text-destructive relative z-10" />
                <span className="text-destructive font-medium relative z-10">Salir</span>
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

          {/* Grid de perfiles con diseño 3D mejorado */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12 mb-16">
            {profiles.map((profile, index) => (
              <button
                key={profile.id}
                className="flex flex-col items-center space-y-6 cursor-pointer group perspective-1000 bg-transparent border-none p-0"
                style={{ 
                  animation: `slideInUp 0.8s ease-out ${index * 0.15}s both`,
                }}
                aria-label={`Seleccionar perfil de ${profile.name}`}
                onClick={() => handleProfileSelect(profile.id)}
              >
                {/* Avatar del perfil con efectos 3D */}
                <div className="relative transform-gpu transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                  {/* Sombra dinámica */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-primary/20 rounded-full blur-lg scale-0 group-hover:scale-100 transition-all duration-500"></div>
                  
                  {/* Anillo exterior animado */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"></div>
                  
                  {/* Anillo intermedio */}
                  <div className="absolute -inset-2 bg-background rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Avatar principal */}
                  <div className={`
                    relative w-32 h-32 md:w-40 md:h-40 rounded-3xl ${profile.color} 
                    flex items-center justify-center text-white text-4xl md:text-5xl font-black
                    transition-all duration-500 group-hover:rotate-y-12
                    border-4 border-white/20 group-hover:border-white/40
                    shadow-2xl group-hover:shadow-3xl
                    overflow-hidden backdrop-blur-sm
                  `}>
                    {/* Efectos de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    ) : (
                      <span className="select-none relative z-10 drop-shadow-lg">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    
                    {/* Efecto de partículas flotantes */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"></div>
                    <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
                  </div>
                  
                  {/* Indicador de perfil infantil premium */}
                  {profile.is_kids && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border-2 border-white/30 backdrop-blur-sm transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>KIDS</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/30 to-emerald-500/30 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  {/* Indicador de estado online */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                  </div>
                </div>

                {/* Información del perfil mejorada */}
                <div className="text-center space-y-3 transform transition-all duration-300 group-hover:-translate-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 drop-shadow-sm">
                    {profile.name}
                  </h3>
                  
                  {profile.is_kids && (
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 backdrop-blur-sm">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">Perfil Protegido</span>
                    </div>
                  )}
                  
                  {/* Barra de progreso decorativa */}
                  <div className="relative w-16 h-1 mx-auto bg-muted rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 rounded-full"></div>
                  </div>
                  
                  {/* Estadísticas del perfil */}
                  <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-accent fill-current" />
                      <span>Premium</span>
                    </div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Activo</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Botón para crear nuevo perfil con diseño mejorado */}
            {profiles.length < 5 && (
              <button
                className="flex flex-col items-center space-y-6 cursor-pointer group perspective-1000 bg-transparent border-none p-0"
                style={{ 
                  animation: `slideInUp 0.8s ease-out ${profiles.length * 0.15}s both`,
                }}
                aria-label="Crear nuevo perfil"
                onClick={() => setShowCreateProfile(true)}
              >
                {/* Botón de añadir con efectos 3D */}
                <div className="relative transform-gpu transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                  {/* Sombra dinámica */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-muted/30 rounded-full blur-lg scale-0 group-hover:scale-100 transition-all duration-500"></div>
                  
                  {/* Anillo animado */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-muted via-primary to-muted rounded-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                  
                  <div className="
                    relative w-32 h-32 md:w-40 md:h-40 rounded-3xl 
                    bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50
                    flex items-center justify-center text-muted-foreground
                    transition-all duration-500 group-hover:from-primary/20 group-hover:via-accent/20 group-hover:to-primary/20 
                    group-hover:text-primary border-4 border-dashed border-muted-foreground/30 
                    group-hover:border-primary group-hover:border-solid
                    shadow-xl group-hover:shadow-2xl
                    backdrop-blur-sm overflow-hidden
                  ">
                    {/* Efectos de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <Plus className="w-16 h-16 md:w-20 md:h-20 transition-all duration-500 group-hover:rotate-90 group-hover:scale-110 drop-shadow-lg relative z-10" />
                    
                    {/* Efecto de pulso */}
                    <div className="absolute inset-4 bg-primary/10 rounded-2xl scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                  </div>
                </div>

                {/* Información mejorada */}
                <div className="text-center space-y-3 transform transition-all duration-300 group-hover:-translate-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    Añadir Perfil
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors">
                    Hasta {5 - profiles.length} perfiles más
                  </p>
                  
                  {/* Barra de progreso decorativa */}
                  <div className="relative w-16 h-1 mx-auto bg-muted rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 rounded-full"></div>
                  </div>
                  
                  {/* Call to action */}
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">¡Crear ahora!</span>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Información adicional y estadísticas mejoradas */}
          <div className="text-center space-y-8" style={{ animation: 'fadeInUp 0.8s ease-out 0.8s both' }}>
            {/* Estadísticas de la cuenta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="group p-6 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-2xl border border-border/30 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
                    <p className="text-sm text-muted-foreground">Perfiles Activos</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-2xl border border-border/30 hover:border-accent/30 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-accent/20 rounded-xl">
                    <Crown className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">Premium</p>
                    <p className="text-sm text-muted-foreground">Plan Activo</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-2xl border border-border/30 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">{profiles.filter(p => p.is_kids).length}</p>
                    <p className="text-sm text-muted-foreground">Perfiles Infantiles</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to action principal */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border/30">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div className="text-left space-y-2">
                    <h3 className="text-xl font-bold text-foreground">¿Necesitas ayuda?</h3>
                    <p className="text-muted-foreground">
                      Gestiona perfiles, configuración y más desde tu panel de control
                    </p>
                  </div>
                  <button className="group relative inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <Settings className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Configuración</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Features premium */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="flex flex-col items-center space-y-2 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/20 hover:border-primary/30 transition-all duration-300 group">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">4K Ultra HD</span>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/20 hover:border-accent/30 transition-all duration-300 group">
                <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">Control Parental</span>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/20 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <Star className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-foreground">Sin Anuncios</span>
              </div>
              
              <div className="flex flex-col items-center space-y-2 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/20 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-foreground">Contenido Exclusivo</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para crear perfil mejorado */}
      {showCreateProfile && (
        <button 
          className="modal-overlay backdrop-blur-md bg-transparent border-none w-full h-full cursor-default" 
          aria-label="Cerrar modal"
          onClick={() => setShowCreateProfile(false)}
        >
          <div className="modal-premium max-w-lg w-full mx-4 relative">
            {/* Efectos de fondo del modal */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-30 blur"></div>
            
            <div className="relative bg-card border border-border/50 rounded-2xl p-8 backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-primary/20 rounded-xl mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 id="modal-title" className="text-3xl font-bold text-foreground">Crear Nuevo Perfil</h2>
                <p className="text-muted-foreground mt-2">Personaliza tu experiencia de streaming</p>
              </div>
              
              <div className="space-y-6">
                {/* Nombre del perfil */}
                <div className="input-premium relative">
                  <input
                    type="text"
                    id="profile-name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder=" "
                    className="w-full px-4 py-4 bg-input/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    maxLength={20}
                  />
                  <label htmlFor="profile-name" className="absolute -top-3 left-4 px-2 text-sm font-medium text-muted-foreground bg-card">
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
                      <label 
                        htmlFor="kids-profile" 
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                          isKidsProfile 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {isKidsProfile && <Shield className="h-4 w-4 text-white" />}
                      </label>
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
        </button>
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