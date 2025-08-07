import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AppSettings {
  id?: string;
  site_name: string;
  site_description: string;
  site_logo?: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_upload_size: number;
  allowed_file_types: string[];
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  default_user_role: string;
  content_moderation: boolean;
}

const defaultSettings: AppSettings = {
  site_name: 'WatchHub',
  site_description: 'La mejor plataforma de streaming para toda la familia. Películas, series y documentales en un solo lugar.',
  maintenance_mode: false,
  registration_enabled: true,
  max_upload_size: 500,
  allowed_file_types: ['mp4', 'avi', 'mkv', 'mov'],
  default_user_role: 'usuario',
  content_moderation: true
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: settingsData, error } = await supabase
          .from('app_settings')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116' || error.code === '42P01') {
            // No hay configuración o tabla no existe - usar por defecto
            console.log('Usando configuración por defecto');
            setSettings(defaultSettings);
            return;
          }
          throw error;
        }

        if (settingsData) {
          setSettings({ ...defaultSettings, ...settingsData });
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
        setError('Error al cargar configuración');
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Configurar suscripción en tiempo real para escuchar cambios
    const channel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings'
        },
        (payload) => {
          console.log('Configuración actualizada:', payload);
          if (payload.new) {
            setSettings({ ...defaultSettings, ...payload.new as AppSettings });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading, error };
}

export type { AppSettings };
