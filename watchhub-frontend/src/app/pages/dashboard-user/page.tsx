'use client'

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Plus, Film, User, Baby } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import '@/styles/dashboard-animations.css'
import SubscriptionProtectedRoute from '@/components/SubscriptionProtectedRoute'

interface Profile {
  id: string
  nombre: string
  tipo: 'viewer' | 'child'
  color: string
  avatar_url?: string
}

function DashboardContent() {
  const { user, loading, signOut } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [showManageProfiles, setShowManageProfiles] = useState(false)
  const [editProfileId, setEditProfileId] = useState<string | null>(null)
  const [editProfileName, setEditProfileName] = useState('')
  const [editProfileType, setEditProfileType] = useState<'viewer' | 'child'>('viewer')
  const [editProfileAvatar, setEditProfileAvatar] = useState<string>('')
  const [newProfileName, setNewProfileName] = useState('')
  const [isKidsProfile, setIsKidsProfile] = useState(false)
  const [newProfileAvatar, setNewProfileAvatar] = useState<string>('')
  const [avatars, setAvatars] = useState<string[]>([])
  const [maxProfiles, setMaxProfiles] = useState(1)
  const [planName, setPlanName] = useState('')
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const router = useRouter()
  // Cargar avatares disponibles desde el bucket de storage
  const fetchAvatars = useCallback(async () => {
    try {
  const { data } = await supabase.storage.from('avatar').list('perfiles', { limit: 100 })
      if (data) {
        const urls = await Promise.all(
          data
            .filter((file: any) => file.name.match(/\.(png|jpg|jpeg|svg)$/i))
            .map(async (file: any) => {
              const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(`perfiles/${file.name}`)
              return urlData.publicUrl
            })
        )
        setAvatars(urls)
      }
    } catch (e) {
      // Log para debug, pero no romper funcionalidad
      // eslint-disable-next-line no-console
      console.error('Error al cargar avatares:', e)
      setAvatars([])
    }
  }, [])


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

  // Lógica para obtener el plan y perfiles reales
  const fetchProfilesAndPlan = useCallback(async () => {
    if (!user) return
    setLoadingProfiles(true)
    try {
      // 1. Obtener suscripción activa
      const { data: subscription } = await supabase
        .from('suscripciones')
        .select('plan_id, activa')
        .eq('cuenta_id', user.id)
        .eq('activa', true)
        .gt('expira_en', new Date().toISOString())
        .single()
      if (!subscription) {
        setMaxProfiles(1)
        setPlanName('Básico')
        setProfiles([])
        setLoadingProfiles(false)
        return
      }
      // 2. Obtener plan
      const { data: plan } = await supabase
        .from('planes')
        .select('nombre')
        .eq('id', subscription.plan_id)
        .single()
      let max = 1
      let planNombre = 'Básico'
      if (plan?.nombre === 'premium') { max = 4; planNombre = 'Premium' }
      else if (plan?.nombre === 'estandar') { max = 2; planNombre = 'Estándar' }
      setMaxProfiles(max)
      setPlanName(planNombre)
      // 3. Obtener perfiles de la base de datos
      const { data: perfiles } = await supabase
        .from('perfiles')
        .select('id, nombre, tipo, avatar_url')
        .eq('cuenta_id', user.id)
      // 4. Si no existe perfil principal, crearlo automáticamente
      if (!perfiles || perfiles.length === 0) {
        const nombrePrincipal = user.user_metadata?.first_name || user.user_metadata?.nombre || 'Principal'
        const { data: perfilCreado } = await supabase
          .from('perfiles')
          .insert([{ cuenta_id: user.id, nombre: nombrePrincipal, tipo: 'viewer' }])
          .select('id, nombre, tipo')
          .single()
    if (perfilCreado?.id && perfilCreado?.nombre && perfilCreado?.tipo) {
          setProfiles([{ id: perfilCreado.id, nombre: perfilCreado.nombre, tipo: perfilCreado.tipo, color: profileColors[0] }])
        } else {
          setProfiles([])
        }
      } else {
        // Asignar color a cada perfil
        setProfiles(perfiles.map((p, i) => ({ id: p.id, nombre: p.nombre, tipo: p.tipo, color: profileColors[i % profileColors.length] })))
      }
    } catch (error) {
      console.error('Error fetching profiles or plan:', error)
    }
    setLoadingProfiles(false)
  }, [user, profileColors])

  useEffect(() => {
    if (user) {
      fetchProfilesAndPlan()
      fetchAvatars()
    }
  }, [user, fetchProfilesAndPlan, fetchAvatars])

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
    if (profiles.length >= maxProfiles) return
    if (!user) return
    try {
      const tipo = isKidsProfile ? 'child' : 'viewer'
      const { data: perfilCreado } = await supabase
        .from('perfiles')
        .insert([{ cuenta_id: user.id, nombre: newProfileName, tipo, avatar_url: newProfileAvatar }])
        .select('id, nombre, tipo, avatar_url')
        .single()
    if (perfilCreado?.id && perfilCreado?.nombre && perfilCreado?.tipo) {
        setProfiles([...profiles, { id: perfilCreado.id, nombre: perfilCreado.nombre, tipo: perfilCreado.tipo, color: profileColors[profiles.length % profileColors.length], avatar_url: perfilCreado.avatar_url }])
      }
    } catch (error) {
      console.error('Error creando perfil:', error)
    }
    setNewProfileName('')
    setIsKidsProfile(false)
    setNewProfileAvatar('')
    setShowCreateProfile(false)
  }

  if (loading || loadingProfiles) {
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

  // Avatar por defecto visual
  const renderAvatar = (profile: Profile, size = 'xl') => {
    if (profile.avatar_url) {
      return <img src={profile.avatar_url} alt={profile.nombre} className={`rounded-lg object-cover ${size === 'xl' ? 'w-32 h-32 md:w-40 md:h-40' : 'w-12 h-12'}`} />
    }
    // Icono por tipo
    if (profile.tipo === 'child') return <Baby className={size === 'xl' ? 'w-20 h-20' : 'w-8 h-8'} />
    return <User className={size === 'xl' ? 'w-20 h-20' : 'w-8 h-8'} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-foreground">
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
          {/* Mostrar plan actual */}
          <div className="flex items-center space-x-4">
            <span className="text-sm bg-primary/10 text-primary px-4 py-1 rounded-full font-semibold">
              Plan actual: {planName}
            </span>
            {/* Botón salir simple */}
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal  */}
      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Título principal */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            ¡Bienvenido!
          </h1>
          <p className="text-4xl md:text-5xl font-bold text-primary mb-2 mt-6">¿Quién está viendo?</p>
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="text-lg text-primary font-semibold bg-primary/10 px-4 py-1 rounded-full inline-block">Plan: {planName}</span>
            <span className="text-sm text-muted-foreground">Perfiles permitidos: <b>{maxProfiles}</b></span>
          </div>
        </div>

        {/* Grid de perfiles */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className="flex flex-col items-center space-y-3 group cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleProfileSelect(profile.id)}
            >
              {/* Avatar visual */}
              <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-lg flex items-center justify-center bg-gradient-to-br ${profile.color} shadow-lg border-4 border-transparent group-hover:border-primary transition-all`}>
                {renderAvatar(profile, 'xl')}
                {profile.tipo === 'child' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold shadow-lg">
                    KIDS
                  </div>
                )}
              </div>
              {/* Nombre del perfil */}
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors font-semibold drop-shadow">
                {profile.nombre}
              </span>
            </button>
          ))}

          {/* Botón agregar perfil simple */}
          {profiles.length < maxProfiles && (
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
          <button
            className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium border border-muted-foreground hover:border-foreground px-8 py-2 rounded"
            onClick={() => setShowManageProfiles(true)}
          >
            Administrar perfiles
          </button>
        </div>
      </main>

      {/* Modal crear perfil */}
      {showCreateProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
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
              {/* Selección de avatar */}
              <div>
                <label htmlFor="avatar-select-create" className="block text-sm font-medium mb-2">Selecciona un avatar</label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {avatars.length === 0 && <span className="text-xs text-muted-foreground">No hay avatares disponibles</span>}
                  {avatars.map((url) => (
                    <button
                      key={url}
                      type="button"
                      className={`rounded-full border-2 ${newProfileAvatar === url ? 'border-primary' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      onClick={() => setNewProfileAvatar(url)}
                    >
                      <img src={url} alt="avatar" className="w-14 h-14 object-cover rounded-full" />
                    </button>
                  ))}
                </div>
              </div>
              {/* Vista previa */}
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto rounded-lg ${profileColors[profiles.length % profileColors.length]} flex items-center justify-center text-white text-2xl font-semibold mb-3`}
                >
                  {newProfileAvatar ? (
                    <img src={newProfileAvatar} alt="avatar" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    newProfileName.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {newProfileName || 'Nuevo perfil'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Plan actual: <span className="font-bold">{planName}</span> &bull; Perfiles permitidos: <span className="font-bold">{maxProfiles}</span>
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

      {/* Modal administrar perfiles */}
      {showManageProfiles && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Administrar perfiles
            </h2>
            <div className="space-y-6">
              {profiles.map((profile, idx) => (
                <div key={profile.id} className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${profile.color} flex items-center justify-center text-white text-xl font-semibold overflow-hidden`}>{renderAvatar(profile, 'sm')}</div>
                    <div>
                      <div className="font-semibold text-foreground">{profile.nombre}</div>
                      <div className="text-xs text-muted-foreground">{profile.tipo === 'child' ? 'Niños' : 'General'}</div>
                    </div>
                  </div>
                  {/* No permitir editar/eliminar el primer perfil (principal) */}
                  {idx > 0 && (
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-500 hover:underline text-sm"
                        onClick={() => {
                          setEditProfileId(profile.id)
                          setEditProfileName(profile.nombre)
                          setEditProfileType(profile.tipo)
                          setEditProfileAvatar(profile.avatar_url || '')
                        }}
                      >Editar</button>
                      <button
                        className="text-red-500 hover:underline text-sm"
                        onClick={async () => {
                          await supabase.from('perfiles').delete().eq('id', profile.id)
                          setProfiles(profiles.filter(p => p.id !== profile.id))
                        }}
                      >Eliminar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Botones */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowManageProfiles(false)}
                className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cerrar
              </button>
            </div>
            {/* Modal editar perfil */}
            {editProfileId && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-background border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
                  <h3 className="text-xl font-bold mb-4 text-center">Editar perfil</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editProfileName}
                      onChange={e => setEditProfileName(e.target.value)}
                      className="w-full px-4 py-2 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      maxLength={20}
                    />
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="edit-kids-checkbox"
                        checked={editProfileType === 'child'}
                        onChange={e => setEditProfileType(e.target.checked ? 'child' : 'viewer')}
                        className="w-4 h-4"
                      />
                      <label htmlFor="edit-kids-checkbox" className="text-foreground">
                        Este es un perfil para niños
                      </label>
                    </div>
                    {/* Selección de avatar para editar */}
                    <div>
                      <label htmlFor="avatar-select-edit" className="block text-sm font-medium mb-2">Selecciona un avatar</label>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {avatars.length === 0 && <span className="text-xs text-muted-foreground">No hay avatares disponibles</span>}
                        {avatars.map((url) => (
                          <button
                            key={url}
                            type="button"
                            className={`rounded-full border-2 ${editProfileAvatar === url ? 'border-primary' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                            onClick={() => setEditProfileAvatar(url)}
                          >
                            <img src={url} alt="avatar" className="w-14 h-14 object-cover rounded-full" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setEditProfileId(null)}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >Cancelar</button>
                    <button
                      onClick={async () => {
                        await supabase.from('perfiles').update({ nombre: editProfileName, tipo: editProfileType, avatar_url: editProfileAvatar }).eq('id', editProfileId)
                        setProfiles(profiles.map(p => p.id === editProfileId ? { ...p, nombre: editProfileName, tipo: editProfileType, avatar_url: editProfileAvatar } : p))
                        setEditProfileId(null)
                      }}
                      disabled={!editProfileName.trim()}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >Guardar</button>
                  </div>
                </div>
              </div>
            )}
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