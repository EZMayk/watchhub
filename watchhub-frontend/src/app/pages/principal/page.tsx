
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut, User, Play, Search, Film, Info, Heart, HeartOff, Share2 } from 'lucide-react'
import { VideoPlayer } from '@/components/VideoPlayer'
import Modal from '@/components/ui/Modal'
import SubscriptionProtectedRoute from '@/components/SubscriptionProtectedRoute'
import { Button } from '@/components/ui/Button'

function PrincipalContent() {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [resumeTime, setResumeTime] = useState<number>(0);
  const [historial, setHistorial] = useState<any[]>([]);

  // Guardar progreso de visualización
  const saveProgress = async (titleId: string, currentTime: number) => {
    if (!selectedProfile) return;
    // upsert: si existe, actualiza; si no, inserta
  await supabase.from('historial_visualizacion').upsert({ perfil_id: selectedProfile, titulo_id: titleId, progreso: currentTime, updated_at: new Date().toISOString() }, { onConflict: 'perfil_id,titulo_id' });
  };

  // Obtener progreso guardado
  const fetchProgress = async (titleId: string) => {
    if (!selectedProfile) return 0;
    const { data } = await supabase.from('historial_visualizacion').select('progreso').eq('perfil_id', selectedProfile).eq('titulo_id', titleId).single();
    return data?.progreso || 0;
  };

  // Obtener historial para sección "Continuar viendo"
  const fetchHistorial = async () => {
    if (!selectedProfile) return;
    const { data } = await supabase.from('historial_visualizacion').select('*, titulos(*)').eq('perfil_id', selectedProfile).order('updated_at', { ascending: false }).limit(10);
    setHistorial(data || []);
  };

  // Sugerencia: función para compartir (puedes expandirla luego)
  const handleShare = (title: any) => {
    if (navigator.share) {
      navigator.share({
        title: title.titulo,
        text: title.descripcion,
        url: window.location.href
      });
    } else {
      window.prompt('Copia este enlace:', window.location.href);
    }
  };
  const { user, loading, signOut } = useAuth()
  const [titles, setTitles] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<'inicio' | 'peliculas' | 'series' | 'milista'>('inicio')
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
      fetchFavorites(profileId)
      fetchHistorial()
    }
  }, [user, router])

  const handleToggleFavorite = async (titleId: string) => {
    if (!selectedProfile) return;
    const isFav = favorites.includes(titleId);
    if (isFav) {
      // Quitar de favoritos
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('perfil_id', selectedProfile)
        .eq('titulo_id', titleId);
      if (!error) setFavorites(favorites.filter((id) => id !== titleId));
    } else {
      // Agregar a favoritos
      const { error } = await supabase
        .from('favoritos')
        .insert([{ perfil_id: selectedProfile, titulo_id: titleId }]);
      if (!error) setFavorites([...favorites, titleId]);
    }
  };

  const fetchFavorites = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('titulo_id')
        .eq('perfil_id', profileId)
      if (error) throw error
      setFavorites(data?.map((f: any) => f.titulo_id) || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const fetchTitles = async () => {
    try {
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .eq('visible', true)
        .limit(50)
        .order('created_at', { ascending: false })

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

  // Filtrado de títulos según búsqueda
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTitles = normalizedQuery
    ? titles.filter((t) => {
        return (
          t.titulo?.toLowerCase().includes(normalizedQuery) ||
          t.descripcion?.toLowerCase().includes(normalizedQuery) ||
          t.genero?.toLowerCase().includes(normalizedQuery) ||
          t.director?.toLowerCase().includes(normalizedQuery) ||
          t.actores?.toLowerCase().includes(normalizedQuery) ||
          t.categoria?.toLowerCase().includes(normalizedQuery) ||
          (t.año?.toString().includes(normalizedQuery)) ||
          t.duracion?.toLowerCase().includes(normalizedQuery)
        );
      })
    : titles;

  // Manejar abrir video: buscar progreso
  const handleOpenPlayer = async (title: any) => {
    setCurrentTitle(title);
    setPlayerOpen(true);
    const progress = await fetchProgress(title.id);
    setResumeTime(progress);
  };

  // Guardar progreso cada vez que cambia el tiempo
  const handleTimeUpdate = (current: number) => {
    if (currentTitle) {
      saveProgress(currentTitle.id, current);
    }
  };

  // Al cerrar el modal, guardar el último progreso
  const handleClosePlayer = () => {
    setPlayerOpen(false);
    setResumeTime(0);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header estilo Netflix */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Film className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-white">WatchHub</h1>
              </div>
              {/* Navigation */}
              <nav className="hidden md:flex gap-6">
                <Button variant={activeFilter === 'inicio' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveFilter('inicio')} aria-label="Ver inicio">Inicio</Button>
                <Button variant={activeFilter === 'peliculas' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveFilter('peliculas')} aria-label="Ver películas">Películas</Button>
                <Button variant={activeFilter === 'series' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveFilter('series')} aria-label="Ver series">Series</Button>
                <Button variant={activeFilter === 'milista' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveFilter('milista')} aria-label="Ver mi lista">Mi Lista</Button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Button variant="ghost" size="icon" aria-label="Buscar" onClick={() => setShowSearch(!showSearch)}>
                  <Search className="h-5 w-5" />
                </Button>
                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-black/95 border border-gray-700 rounded-md p-4 shadow-xl animate-fade-in">
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
              <Button variant="ghost" size="icon" aria-label="Cambiar perfil" onClick={handleBackToProfiles}>
                <User className="h-5 w-5" />
              </Button>
              {/* Sign Out */}
              <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
  {activeFilter === 'inicio' && filteredTitles.length > 0 && (
          <div className="relative h-screen bg-cover bg-center" style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url(${filteredTitles[0].imagen_portada || 'https://via.placeholder.com/1920x1080'})`
          }}>
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-bold mb-4">{filteredTitles[0].titulo}</h1>
                  <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                    {filteredTitles[0].descripcion || 'Descubre el contenido más emocionante en WatchHub'}
                  </p>
                  
                  <div className="flex space-x-4">
                    <button
                      className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded hover:bg-gray-200 transition-colors font-semibold"
                      onClick={() => {
                        handleOpenPlayer(filteredTitles[0]);
                      }}
                    >
                      <Play className="h-5 w-5" />
                      <span>Reproducir</span>
                    </button>
                    <button
                      className="flex items-center space-x-2 bg-gray-600/70 text-white px-8 py-3 rounded hover:bg-gray-600 transition-colors font-semibold"
                      onClick={() => {
                        setCurrentTitle(filteredTitles[0]);
                        setShowDetails(true);
                      }}
                    >
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
                {filteredTitles.slice(0, 10).map((title) => (
                  <div
                    key={title.id}
                    className="flex-none w-48 group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        src={title.imagen_portada || 'https://via.placeholder.com/300x400'}
                        alt={title.titulo}
                        className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                        onClick={() => {
                          handleOpenPlayer(title);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      {/* Botón favoritos */}
                      <button
                        onClick={() => handleToggleFavorite(title.id)}
                        className={`absolute top-2 right-2 z-10 p-1 rounded-full ${favorites.includes(title.id) ? 'bg-red-600' : 'bg-gray-800/80'} hover:bg-red-700 transition-colors`}
                        title={favorites.includes(title.id) ? 'Quitar de Mi Lista' : 'Agregar a Mi Lista'}
                      >
                        {favorites.includes(title.id) ? <Heart className="w-6 h-6 text-white" /> : <HeartOff className="w-6 h-6 text-white" />}
                      </button>
                      {/* Botón compartir */}
                      <button
                        onClick={() => handleShare(title)}
                        className="absolute top-2 left-2 z-10 p-1 rounded-full bg-gray-800/80 hover:bg-blue-700 transition-colors"
                        title="Compartir"
                      >
                        <Share2 className="w-5 h-5 text-white" />
                      </button>
                      {/* Botón detalles */}
                      <button
                        onClick={() => { setCurrentTitle(title); setShowDetails(true); }}
                        className="absolute bottom-2 left-2 z-10 p-1 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
                        title="Ver detalles"
                      >
                        <Info className="w-5 h-5 text-white" />
                      </button>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors" onClick={() => handleOpenPlayer(title)}>
                          <Play className="h-6 w-6" />
                        </button>
                      </div>
      {/* Modal de reproducción */}
      <Modal isOpen={playerOpen} onClose={handleClosePlayer} size="xl" title={currentTitle?.titulo}>
        {currentTitle && (
          <VideoPlayer
            src={currentTitle.url_video}
            poster={currentTitle.imagen_portada}
            title={currentTitle.titulo}
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            startTime={resumeTime}
          />
        )}
      </Modal>
      {/* Apartado destacado: Continuar viendo tipo Netflix mejorado */}
      {(() => {
        // Filtrar duplicados y solo mostrar títulos con progreso > 0 y duración válida
        const vistos = historial
          .filter((item, idx, arr) =>
            arr.findIndex((el) => el.titulo_id === item.titulo_id) === idx
          )
          .filter(item => {
            const prog = Number(item.progreso || 0);
            const dur = Number(item.titulos?.duracion_segundos || 0);
            return item.titulos && dur > 0 && prog > 0 && prog < dur - 10; // Solo si hay avance real y no está terminado
          });
        if (!vistos.length) return null;
        return (
          <section className="py-8 mb-8 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight" style={{fontFamily:'Netflix Sans,Helvetica Neue,Segoe UI,Roboto,Arial,sans-serif'}}>Continuar viendo</h2>
              <div className="relative">
                {/* Flecha izquierda */}
                <button
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg"
                  style={{left: '-18px'}} 
                  onClick={() => {
                    const el = document.getElementById('continue-carousel');
                    if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                  }}
                  aria-label="Desplazar a la izquierda"
                >
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {/* Carrusel */}
                <div
                  id="continue-carousel"
                  className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
                  style={{scrollbarWidth:'none'}}
                >
                  {vistos.map((item) => {
                    const progreso = Math.min(100, (item.progreso || 0) / (item.titulos.duracion_segundos || 1) * 100);
                    return (
                      <div
                        key={item.titulo_id}
                        className="flex flex-col w-44 md:w-56 flex-shrink-0 snap-start cursor-pointer group hover:scale-105 transition-transform"
                        onClick={() => handleOpenPlayer(item.titulos)}
                        style={{fontFamily:'Netflix Sans,Helvetica Neue,Segoe UI,Roboto,Arial,sans-serif'}}
                      >
                        <div className="relative rounded-lg overflow-hidden shadow-lg bg-neutral-900">
                          <img
                            src={item.titulos.imagen_portada}
                            alt={item.titulos.titulo}
                            className="w-full h-28 md:h-36 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                            draggable="false"
                          />
                          {/* Barra de progreso tipo Netflix */}
                          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/60">
                            <div
                              className="bg-red-600 h-2 rounded-t"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          {/* Overlay al hacer hover */}
                          <div className="absolute inset-0 flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-2">
                            <div className="w-full flex flex-col items-center mb-2">
                              <span className="text-white text-sm font-bold text-center mb-2 truncate w-full drop-shadow-lg">{item.titulos.titulo}</span>
                              <div className="flex gap-2">
                                <button
                                  className="bg-white text-black p-2 rounded-full shadow hover:bg-red-600 hover:text-white transition-colors"
                                  onClick={e => { e.stopPropagation(); handleOpenPlayer(item.titulos); }}
                                  aria-label="Reproducir"
                                >
                                  <Play className="h-5 w-5" />
                                </button>
                                <button
                                  className="bg-neutral-800 text-white p-2 rounded-full shadow hover:bg-neutral-700 transition-colors"
                                  onClick={e => { e.stopPropagation(); setCurrentTitle(item.titulos); setShowDetails(true); }}
                                  aria-label="Más opciones"
                                >
                                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Título solo en mobile (sin hover) */}
                        <div className="mt-2 px-1 block md:hidden">
                          <span className="text-white text-xs truncate text-center w-full block">{item.titulos.titulo}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Flecha derecha */}
                <button
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg"
                  style={{right: '-18px'}}
                  onClick={() => {
                    const el = document.getElementById('continue-carousel');
                    if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                  }}
                  aria-label="Desplazar a la derecha"
                >
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Modal de detalles */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} size="md" title={currentTitle?.titulo}>
        {currentTitle && (
          <div className="space-y-2">
            <img src={currentTitle.imagen_portada} alt={currentTitle.titulo} className="w-full rounded" />
            <p className="text-sm text-gray-300">{currentTitle.descripcion}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-gray-700 rounded px-2 py-1 text-xs">{currentTitle.tipo}</span>
              <span className="bg-gray-700 rounded px-2 py-1 text-xs">{currentTitle.genero}</span>
              <span className="bg-gray-700 rounded px-2 py-1 text-xs">{currentTitle.categoria}</span>
              <span className="bg-gray-700 rounded px-2 py-1 text-xs">{currentTitle.año}</span>
              <span className="bg-gray-700 rounded px-2 py-1 text-xs">{currentTitle.duracion}</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              <div><b>Director:</b> {currentTitle.director}</div>
              <div><b>Actores:</b> {currentTitle.actores}</div>
            </div>
          </div>
        )}
      </Modal>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="font-medium text-sm line-clamp-1">{title.titulo}</h3>
                      <p className="text-gray-400 text-sm">{title.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Películas */}
          {(activeFilter === 'inicio' || activeFilter === 'peliculas') && (
            <section className="py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Películas populares</h2>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Ver todo
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {filteredTitles.filter(t => t.tipo?.toLowerCase() === 'pelicula').slice(0, 10).map((title) => (
                    <div
                      key={title.id}
                      className="flex-none w-48 group cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-md">
                        <img
                          src={title.imagen_portada || 'https://via.placeholder.com/300x400'}
                          alt={title.titulo}
                          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Botón favoritos */}
                        <Button
                          variant={favorites.includes(title.id) ? 'destructive' : 'ghost'}
                          size="icon"
                          aria-label={favorites.includes(title.id) ? 'Quitar de Mi Lista' : 'Agregar a Mi Lista'}
                          className="absolute top-2 right-2 z-10"
                          onClick={() => handleToggleFavorite(title.id)}
                        >
                          {favorites.includes(title.id) ? <Heart className="w-6 h-6 text-white" /> : <HeartOff className="w-6 h-6 text-white" />}
                        </Button>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            variant="default"
                            size="icon"
                            aria-label="Reproducir"
                            className="bg-white text-black hover:bg-gray-200"
                          >
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium text-sm line-clamp-1">{title.titulo}</h3>
                        <p className="text-gray-400 text-sm">{title.tipo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Series */}
          {(activeFilter === 'inicio' || activeFilter === 'series') && (
            <section className="py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Series recomendadas</h2>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Ver todo
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {filteredTitles.filter(t => t.tipo?.toLowerCase() === 'serie').slice(0, 10).map((title) => (
                    <div
                      key={title.id}
                      className="flex-none w-48 group cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-md">
                        <img
                          src={title.imagen_portada || 'https://via.placeholder.com/300x400'}
                          alt={title.titulo}
                          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            variant="default"
                            size="icon"
                            aria-label="Reproducir"
                            className="bg-white text-black hover:bg-gray-200"
                          >
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium text-sm line-clamp-1">{title.titulo}</h3>
                        <p className="text-gray-400 text-sm">{title.tipo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Catálogo completo */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {activeFilter === 'milista' ? 'Mi Lista' : 'Catálogo completo'}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {(activeFilter === 'milista'
                  ? filteredTitles.filter((title) => favorites.includes(title.id))
                  : filteredTitles
                ).map((title) => (
                  <div
                    key={title.id}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        src={title.imagen_portada || 'https://via.placeholder.com/300x400'}
                        alt={title.titulo}
                        className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Botón favoritos */}
                      <Button
                        variant={favorites.includes(title.id) ? 'destructive' : 'ghost'}
                        size="icon"
                        aria-label={favorites.includes(title.id) ? 'Quitar de Mi Lista' : 'Agregar a Mi Lista'}
                        className="absolute top-2 right-2 z-10"
                        onClick={() => handleToggleFavorite(title.id)}
                      >
                        {favorites.includes(title.id) ? <Heart className="w-6 h-6 text-white" /> : <HeartOff className="w-6 h-6 text-white" />}
                      </Button>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="default"
                          size="icon"
                          aria-label="Reproducir"
                          className="bg-white text-black hover:bg-gray-200"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="font-medium text-sm line-clamp-1">{title.titulo}</h3>
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