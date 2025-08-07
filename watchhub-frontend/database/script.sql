-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'WatchHub'::text,
  site_description text DEFAULT 'Plataforma de streaming de contenido audiovisual'::text,
  site_logo text,
  maintenance_mode boolean DEFAULT false,
  registration_enabled boolean DEFAULT true,
  max_upload_size integer DEFAULT 500,
  allowed_file_types ARRAY DEFAULT ARRAY['mp4'::text, 'avi'::text, 'mkv'::text, 'mov'::text],
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_password text,
  default_user_role text DEFAULT 'usuario'::text,
  content_moderation boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  featured_trailers ARRAY DEFAULT '{}'::text[],
  max_homepage_trailers integer DEFAULT 6,
  CONSTRAINT app_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cuentas (
  id uuid NOT NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  correo text NOT NULL UNIQUE,
  rol text DEFAULT 'usuario'::text,
  creada_en timestamp without time zone DEFAULT now(),
  CONSTRAINT cuentas_pkey PRIMARY KEY (id),
  CONSTRAINT cuentas_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  perfil_id uuid,
  titulo_id uuid,
  agregado_en timestamp without time zone DEFAULT now(),
  CONSTRAINT favoritos_pkey PRIMARY KEY (id),
  CONSTRAINT favoritos_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.historial_visualizacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  perfil_id uuid,
  titulo_id uuid,
  visto_en timestamp without time zone DEFAULT now(),
  CONSTRAINT historial_visualizacion_pkey PRIMARY KEY (id),
  CONSTRAINT historial_visualizacion_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.perfiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cuenta_id uuid,
  nombre text NOT NULL,
  tipo text CHECK (tipo = ANY (ARRAY['viewer'::text, 'child'::text])),
  creado_en timestamp without time zone DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.cuentas(id)
);
CREATE TABLE public.reseñas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  perfil_id uuid,
  titulo_id uuid,
  calificacion integer CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario text,
  creada_en timestamp without time zone DEFAULT now(),
  CONSTRAINT reseñas_pkey PRIMARY KEY (id),
  CONSTRAINT reseñas_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.suscripciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cuenta_id uuid,
  tipo text CHECK (tipo = ANY (ARRAY['basico'::text, 'estandar'::text, 'premium'::text])),
  activa boolean DEFAULT true,
  iniciada_en timestamp without time zone DEFAULT now(),
  expira_en timestamp without time zone,
  CONSTRAINT suscripciones_pkey PRIMARY KEY (id),
  CONSTRAINT suscripciones_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.cuentas(id)
);
CREATE TABLE public.titulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['pelicula'::text, 'serie'::text, 'documental'::text, 'trailer'::text])),
  categoria text,
  año integer,
  duracion text,
  director text,
  actores text,
  genero text,
  edad_minima integer DEFAULT 0,
  url_video text,
  imagen_portada text,
  visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT titulos_pkey PRIMARY KEY (id)
);