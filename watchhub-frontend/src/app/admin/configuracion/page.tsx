'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/exports';
import { supabase } from '@/lib/supabase';
import {
  Settings,
  Database,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Upload,
  Film,
  Plus
} from 'lucide-react';
import { Card, CardContent, Input, Button, Alert } from '@/components/ui';

interface AppSettings {
  id?: string;
  site_name: string;
  site_description: string;
  site_logo?: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_upload_size: number;
  allowed_file_types: string[];
  default_user_role: string;
  content_moderation: boolean;
  featured_trailers?: string[]; // IDs de trailers destacados para homepage
  max_homepage_trailers?: number; // Máximo número de trailers en homepage
}

type ConnectionStatus = 'unknown' | 'connected' | 'error';

const defaultSettings: AppSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  site_name: 'WatchHub',
  site_description: 'Plataforma de streaming de contenido audiovisual',
  maintenance_mode: false,
  registration_enabled: true,
  max_upload_size: 500, // MB
  allowed_file_types: ['mp4', 'avi', 'mkv', 'mov'],
  default_user_role: 'usuario',
  content_moderation: true,
  featured_trailers: [],
  max_homepage_trailers: 6
};

// Funciones auxiliares para estilos basados en estado de conexión
const getConnectionStyles = (status: ConnectionStatus) => {
  switch (status) {
    case 'connected':
      return {
        container: 'bg-green-900/30 border-green-800/50',
        icon: 'text-green-400',
        title: 'text-green-300',
        text: 'text-green-200',
        debugText: 'text-green-300',
        indicator: 'bg-green-400'
      };
    case 'error':
      return {
        container: 'bg-red-900/30 border-red-800/50',
        icon: 'text-red-400',
        title: 'text-red-300',
        text: 'text-red-200',
        debugText: 'text-red-300',
        indicator: 'bg-red-400'
      };
    default:
      return {
        container: 'bg-yellow-900/30 border-yellow-800/50',
        icon: 'text-yellow-400',
        title: 'text-yellow-300',
        text: 'text-yellow-200',
        debugText: 'text-yellow-300',
        indicator: 'bg-yellow-400'
      };
  }
};

const getConnectionMessage = (status: ConnectionStatus) => {
  switch (status) {
    case 'connected':
      return 'Conectado exitosamente a Supabase. La configuración se guarda en la tabla app_settings.';
    case 'error':
      return 'Error de conexión con Supabase. Verifica tu configuración de .env.local.';
    default:
      return 'Verificando conexión con Supabase...';
  }
};

const getConnectionStatus = (status: ConnectionStatus) => {
  switch (status) {
    case 'connected':
      return '✅ Tabla app_settings accesible';
    case 'error':
      return '❌ Error de acceso a la tabla';
    default:
      return '⏳ Verificando acceso...';
  }
};

// Función para obtener el mensaje de error apropiado
const getErrorMessage = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  
  if (errorMessage.includes('permission')) {
    return '🔒 Error de permisos: Verifica que tengas acceso a la tabla app_settings';
  }
  if (errorMessage.includes('table') || errorMessage.includes('relation')) {
    return '📋 Error de tabla: La tabla app_settings no existe o no está configurada';
  }
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return '🌐 Error de conexión: Verifica tu conexión a internet y configuración de Supabase';
  }
  
  return `Error al guardar la configuración: ${errorMessage}`;
};

// Componente para el panel de debug
const DebugPanel = ({ 
  connectionStatus, 
  message, 
  saving, 
  settings 
}: { 
  connectionStatus: ConnectionStatus;
  message: { type: 'success' | 'error'; text: string } | null;
  saving: boolean;
  settings: AppSettings;
}) => {
  if (connectionStatus !== 'error' && message?.type !== 'error') {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <h4 className="text-red-300 font-medium mb-3 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-2" />
        Panel de Debug
      </h4>
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400">Estado de conexión:</span>
            <span className={`ml-2 ${connectionStatus === 'error' ? 'text-red-300' : 'text-yellow-300'}`}>
              {connectionStatus}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Supabase URL:</span>
            <span className="ml-2 text-gray-300">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Supabase Key:</span>
            <span className="ml-2 text-gray-300">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Estado guardado:</span>
            <span className={`ml-2 ${saving ? 'text-yellow-300' : 'text-gray-300'}`}>
              {saving ? 'Guardando...' : 'Inactivo'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800 rounded text-xs">
          <div className="text-gray-400 mb-1">Configuración actual:</div>
          <pre className="text-gray-300 whitespace-pre-wrap">
            {JSON.stringify({
              site_name: settings.site_name,
              maintenance_mode: settings.maintenance_mode,
              registration_enabled: settings.registration_enabled,
              id: settings.id
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
const DatabaseInfo = ({ 
  connectionStatus, 
  testing, 
  testConnection 
}: { 
  connectionStatus: ConnectionStatus;
  testing: boolean;
  testConnection: () => void;
}) => (
  <div className={`border rounded-lg p-4 ${getConnectionStyles(connectionStatus).container}`}>
    <div className="flex items-start space-x-3">
      <Database className={`w-5 h-5 mt-0.5 ${getConnectionStyles(connectionStatus).icon}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`font-medium mb-1 ${getConnectionStyles(connectionStatus).title}`}>
            Estado de Base de Datos
          </h4>
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={testing}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-3 py-1 text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${testing ? 'animate-spin' : ''}`} />
            Probar
          </Button>
        </div>
        <p className={`text-sm mb-2 ${getConnectionStyles(connectionStatus).text}`}>
          {getConnectionMessage(connectionStatus)}
        </p>
        <div className={`bg-gray-800 rounded p-2 text-xs flex items-center space-x-2 ${getConnectionStyles(connectionStatus).debugText}`}>
          <span className={`w-2 h-2 rounded-full ${getConnectionStyles(connectionStatus).indicator}`}></span>
          <span>
            {getConnectionStatus(connectionStatus)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Hook personalizado para manejar la configuración
const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availableTrailers, setAvailableTrailers] = useState<any[]>([]);
  const [isLoadingTrailers, setIsLoadingTrailers] = useState(false);

  const initializeSettings = async () => {
    try {
      console.log('Inicializando configuración por defecto...');
      
      const { error } = await supabase
        .from('app_settings')
        .insert([defaultSettings]);

      if (error) {
        console.error('Error al insertar configuración por defecto:', error);
        throw error;
      }

      console.log('Configuración inicializada correctamente');
      setSettings(defaultSettings);
      setMessage({ 
        type: 'success', 
        text: 'Configuración inicializada correctamente' 
      });
    } catch (error) {
      console.error('Error initializing settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage({ 
        type: 'error', 
        text: `Error al inicializar configuración: ${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      console.log('Cargando configuración desde la base de datos...');
      
      const { data: settingsData, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.log('Error al cargar configuración:', error);
        if (error.code === 'PGRST116') {
          console.log('No hay configuración, creando configuración por defecto');
          await initializeSettings();
          return;
        }
        throw error;
      }

      if (settingsData) {
        console.log('Configuración cargada:', settingsData);
        setSettings({ ...defaultSettings, ...settingsData });
        setMessage({ 
          type: 'success', 
          text: 'Configuración cargada desde la base de datos' 
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setSettings(defaultSettings);
      setMessage({ 
        type: 'error', 
        text: `Error al cargar configuración: ${errorMessage}. Usando valores por defecto.` 
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      console.log('🔄 Iniciando proceso de guardado...');
      console.log('📝 Configuración a guardar:', settings);

      await supabase
        .from('app_settings')
        .select('count', { count: 'exact', head: true });

      console.log('✅ Conexión a Supabase verificada');

      const settingsToSave = {
        ...settings,
        id: settings.id || '00000000-0000-0000-0000-000000000001'
      };

      console.log('💾 Datos preparados para guardar:', settingsToSave);

      console.log('🔍 Verificando si existe configuración previa...');
      const { data: existingData, error: checkError } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1);

      if (checkError) {
        console.error('❌ Error al verificar configuración existente:', checkError);
        throw checkError;
      }

      console.log('📊 Configuración existente:', existingData);

      let result;
      if (existingData && existingData.length > 0) {
        console.log('🔄 Actualizando registro existente...');
        result = await supabase
          .from('app_settings')
          .update(settingsToSave)
          .eq('id', existingData[0].id)
          .select();
      } else {
        console.log('➕ Insertando nuevo registro...');
        result = await supabase
          .from('app_settings')
          .insert([settingsToSave])
          .select();
      }

      console.log('📤 Resultado de la operación:', result);

      if (result.error) {
        console.error('❌ Error de Supabase:', result.error);
        throw result.error;
      }

      console.log('✅ Configuración guardada exitosamente');
      setMessage({ 
        type: 'success', 
        text: '✅ Configuración guardada exitosamente en la base de datos' 
      });

      if (result.data?.[0]) {
        setSettings(result.data[0]);
      }

    } catch (error) {
      console.error('💥 Error completo al guardar configuración:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      
      setMessage({ 
        type: 'error', 
        text: getErrorMessage(error)
      });
    } finally {
      console.log('🏁 Finalizando proceso de guardado...');
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return {
    settings,
    loading,
    saving,
    message,
    loadSettings,
    saveSettings,
    handleInputChange,
    clearMessage,
    availableTrailers,
    isLoadingTrailers,
    setAvailableTrailers,
    setIsLoadingTrailers
  };
};

// Componente helper para renderizar trailers
const TrailerSelectionList = ({ 
  availableTrailers, 
  settings, 
  handleInputChange, 
  isLoadingTrailers, 
  loadAvailableTrailers 
}: {
  availableTrailers: any[];
  settings: AppSettings;
  handleInputChange: (key: keyof AppSettings, value: any) => void;
  isLoadingTrailers: boolean;
  loadAvailableTrailers: () => void;
}) => {
  if (isLoadingTrailers) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-400 mr-2" />
        <span className="text-gray-300">Cargando trailers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {availableTrailers.length} trailers disponibles
        </span>
        <Button
          onClick={loadAvailableTrailers}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Actualizar
        </Button>
      </div>

      {availableTrailers.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableTrailers.map((trailer) => {
            const isSelected = settings.featured_trailers?.includes(trailer.id) || false;
            return (
              <button
                key={trailer.id}
                type="button"
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer w-full text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                }`}
                onClick={() => {
                  const currentFeatured = settings.featured_trailers || [];
                  const newFeatured = isSelected
                    ? currentFeatured.filter(id => id !== trailer.id)
                    : [...currentFeatured, trailer.id];
                  handleInputChange('featured_trailers', newFeatured);
                }}
              >
                <div className="relative w-16 h-9 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {trailer.imagen_portada && (
                    <img
                      src={trailer.imagen_portada}
                      alt={trailer.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {trailer.titulo}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {trailer.tipo}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay trailers disponibles</p>
          <p className="text-sm mt-1">
            Sube contenido con videos para mostrar trailers
          </p>
        </div>
      )}
    </div>
  );
};

export default function AdminConfiguracion() {
  const {
    settings,
    loading,
    saving,
    message,
    loadSettings,
    saveSettings,
    handleInputChange,
    clearMessage,
    availableTrailers,
    isLoadingTrailers,
    setAvailableTrailers,
    setIsLoadingTrailers
  } = useAppSettings();

  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'trailers' | 'upload'>('general');

  useEffect(() => {
    loadSettings();
    testConnection();
  }, []);

  useEffect(() => {
    loadAvailableTrailers();
  }, []);

  const testConnection = async () => {
    try {
      setTesting(true);
      console.log('🔗 Probando conexión a Supabase...');
      
      const { error } = await supabase
        .from('app_settings')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Error de conexión:', error);
        setConnectionStatus('error');
        return;
      }

      console.log('✅ Conexión exitosa a Supabase');
      setConnectionStatus('connected');
    } catch (error) {
      console.error('💥 Error al probar conexión:', error);
      setConnectionStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const loadAvailableTrailers = async () => {
    try {
      setIsLoadingTrailers(true);
      console.log('🎬 Cargando trailers disponibles...');
      
      const { data, error } = await supabase
        .from('titulos')
        .select('id, titulo, imagen_portada, url_video, tipo')
        .eq('visible', true)
        .not('url_video', 'is', null)
        .not('url_video', 'eq', '')
        .order('titulo');

      if (error) {
        console.error('❌ Error al cargar trailers:', error);
        return;
      }

      setAvailableTrailers(data || []);
      console.log('✅ Trailers cargados:', data?.length || 0);
    } catch (error) {
      console.error('💥 Error al cargar trailers:', error);
    } finally {
      setIsLoadingTrailers(false);
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'security' as const, label: 'Seguridad', icon: Shield },
    { id: 'trailers' as const, label: 'Trailers', icon: Film },
    { id: 'upload' as const, label: 'Subidas', icon: Upload }
  ];

  if (loading) {
    return (
      <AdminLayout title="Configuración" description="Configuración del sistema">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 h-32"></div>
          <div className="bg-gray-800 rounded-xl p-6 h-64"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configuración" description="Configuración del sistema">
      <div className="space-y-6">
        {/* Mensaje de estado */}
        {message && (
          <Alert 
            variant={message.type === 'error' ? 'error' : 'success'}
            className={message.type === 'error' ? 'border-red-800 bg-red-900/30' : 'border-green-800 bg-green-900/30'}
          >
            {message.type === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <div className="flex items-center justify-between w-full">
              <span className={message.type === 'error' ? 'text-red-300' : 'text-green-300'}>
                {message.text}
              </span>
              <button 
                onClick={clearMessage}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </Alert>
        )}

        {/* Información de configuración de BD */}
        <DatabaseInfo 
          connectionStatus={connectionStatus}
          testing={testing}
          testConnection={testConnection}
        />

        {/* Panel de Debug (solo mostrar si hay errores) */}
        <DebugPanel 
          connectionStatus={connectionStatus}
          message={message}
          saving={saving}
          settings={settings}
        />

        {/* Tabs de navegación */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de las tabs */}
        <div className="space-y-6">
          {/* Tab General */}
          {activeTab === 'general' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuración General
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="site-name" className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Sitio
                    </label>
                    <Input
                      id="site-name"
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Nombre de la aplicación"
                    />
                  </div>

                  <div>
                    <label htmlFor="site-description" className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción del Sitio
                    </label>
                    <textarea
                      id="site-description"
                      value={settings.site_description}
                      onChange={(e) => handleInputChange('site_description', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
                      rows={3}
                      placeholder="Descripción de la plataforma"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Modo Mantenimiento</h4>
                      <p className="text-sm text-gray-400">
                        Deshabilita temporalmente el acceso al sitio
                      </p>
                    </div>
                    <button
                      onClick={() => handleInputChange('maintenance_mode', !settings.maintenance_mode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.maintenance_mode ? 'bg-red-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Seguridad */}
          {activeTab === 'security' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Configuración de Seguridad
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Registro de Usuarios</h4>
                      <p className="text-sm text-gray-400">
                        Permitir que nuevos usuarios se registren
                      </p>
                    </div>
                    <button
                      onClick={() => handleInputChange('registration_enabled', !settings.registration_enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.registration_enabled ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.registration_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Moderación de Contenido</h4>
                      <p className="text-sm text-gray-400">
                        Revisar contenido antes de publicar
                      </p>
                    </div>
                    <button
                      onClick={() => handleInputChange('content_moderation', !settings.content_moderation)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.content_moderation ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.content_moderation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label htmlFor="default-role" className="block text-sm font-medium text-gray-300 mb-2">
                      Rol por Defecto
                    </label>
                    <select
                      id="default-role"
                      value={settings.default_user_role}
                      onChange={(e) => handleInputChange('default_user_role', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:ring-red-500"
                    >
                      <option value="user">Usuario</option>
                      <option value="moderator">Moderador</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Trailers */}
          {activeTab === 'trailers' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Film className="w-5 h-5 mr-2" />
                  Configuración de Trailers
                </h3>

                <div className="space-y-6">
                  {/* Configuración de trailers destacados */}
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="max_homepage_trailers" className="block text-sm font-medium text-gray-300 mb-2">
                          Máximo de trailers en página principal
                        </label>
                        <Input
                          id="max_homepage_trailers"
                          type="number"
                          min="1"
                          max="20"
                          value={settings.max_homepage_trailers || 6}
                          onChange={(e) => handleInputChange('max_homepage_trailers', parseInt(e.target.value))}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="featured-trailers" className="block text-sm font-medium text-gray-300 mb-2">
                        Trailers destacados para página principal
                      </label>
                      <div id="featured-trailers" className="border border-gray-600 rounded-lg p-4 bg-gray-800">
                        <TrailerSelectionList
                          availableTrailers={availableTrailers}
                          settings={settings}
                          handleInputChange={handleInputChange}
                          isLoadingTrailers={isLoadingTrailers}
                          loadAvailableTrailers={loadAvailableTrailers}
                        />
                      </div>
                    </div>

                    {/* Información sobre trailers seleccionados */}
                    {settings.featured_trailers && settings.featured_trailers.length > 0 && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-300">
                              {settings.featured_trailers.length} trailer(s) seleccionado(s)
                            </p>
                            <p className="text-xs text-blue-200 mt-1">
                              Estos trailers aparecerán en la página principal de tu plataforma
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Upload */}
          {activeTab === 'upload' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Configuración de Subidas
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="max-upload-size" className="block text-sm font-medium text-gray-300 mb-2">
                      Tamaño Máximo de Archivo (MB)
                    </label>
                    <Input
                      id="max-upload-size"
                      type="number"
                      value={settings.max_upload_size}
                      onChange={(e) => handleInputChange('max_upload_size', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                      min="1"
                      max="2048"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Tamaño máximo permitido para archivos de video
                    </p>
                  </div>

                  <div>
                    <label htmlFor="allowed-file-types" className="block text-sm font-medium text-gray-300 mb-2">
                      Tipos de Archivo Permitidos
                    </label>
                    <div id="allowed-file-types" className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'].map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={settings.allowed_file_types.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('allowed_file_types', [...settings.allowed_file_types, type]);
                              } else {
                                handleInputChange('allowed_file_types', settings.allowed_file_types.filter(t => t !== type));
                              }
                            }}
                            className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-300">.{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-300 font-medium mb-1">Límites de Almacenamiento</h4>
                        <p className="text-sm text-yellow-200">
                          Ten en cuenta los límites de tu plan de Supabase Storage.
                          Los archivos grandes pueden afectar el rendimiento y costos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={loadSettings}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>

          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
