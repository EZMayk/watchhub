# Script de Base de Datos para WatchHub

## 📋 Descripción
Este script crea todas las tablas, funciones y políticas de seguridad necesarias para la aplicación WatchHub.

## 🚀 Instrucciones de Instalación

### 1. Acceder a Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Accede a tu proyecto
3. Ve a la sección **SQL Editor**

### 2. Ejecutar el Script
1. Copia todo el contenido de `script.sql`
2. Pégalo en el editor SQL de Supabase
3. Ejecuta el script completo

### 3. Verificar la Instalación
Después de ejecutar el script, verifica que se hayan creado las siguientes tablas:
- ✅ `cuentas` - Información de usuarios
- ✅ `suscripciones` - Planes de suscripción
- ✅ `perfiles` - Perfiles de usuario
- ✅ `titulos` - Contenido multimedia
- ✅ `favoritos` - Títulos favoritos
- ✅ `visualizaciones` - Historial de visualizaciones
- ✅ `comentarios` - Comentarios de usuarios
- ✅ `calificaciones` - Sistema de calificaciones
- ✅ `notificaciones` - Sistema de notificaciones
- ✅ `app_settings` - **NUEVA** Configuración de la aplicación

## 🔧 Funciones Incluidas
- `get_user_count()` - Obtener conteo de usuarios
- `is_admin()` - Verificar si un usuario es administrador
- `update_updated_at_column()` - Actualizar timestamp automáticamente

## 🛡️ Políticas de Seguridad (RLS)
El script incluye políticas de **Row Level Security** para:
- Acceso seguro a perfiles propios
- Protección de datos administrativos
- Control de acceso a configuraciones

## ⚠️ Importante para Admins
Para acceder al panel de administración, asegúrate de que tu usuario tenga:
1. Un registro en la tabla `cuentas`
2. El campo `rol` establecido como `'admin'`

### Crear Usuario Admin
```sql
-- Actualizar tu usuario para ser admin (reemplaza con tu email)
UPDATE cuentas 
SET rol = 'admin' 
WHERE correo = 'tu-email@gmail.com';
```

## 🆕 Nuevas Características (v2.0)
- **Configuración de Aplicación**: Panel de configuración para admins
- **Gestión de Usuarios**: CRUD completo de usuarios
- **Sistema de Notificaciones**: Notificaciones internas
- **Mejores Políticas de Seguridad**: RLS más robusto

## 🔍 Troubleshooting

### Error: "relation does not exist"
Si ves errores sobre tablas que no existen:
1. Asegúrate de ejecutar el script completo
2. Verifica que no haya errores en la ejecución
3. Revisa que todas las tablas se hayan creado

### Error: "permission denied"
Si tienes problemas de permisos:
1. Verifica que tu usuario tenga rol `admin`
2. Asegúrate de que RLS esté configurado correctamente
3. Revisa las políticas de seguridad

### Configuración no funciona
Si la página de configuración no carga:
1. Verifica que la tabla `app_settings` exista
2. Asegúrate de que hay un registro por defecto
3. Revisa que tu usuario sea admin

## 📞 Soporte
Si encuentras problemas:
1. Revisa los logs en Supabase Dashboard
2. Verifica la configuración de RLS
3. Asegúrate de que el script se ejecutó completamente

---

CREATE TABLE cuentas (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  rol TEXT DEFAULT 'usuario', -- usuario o admin
  creada_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: suscripciones
CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id UUID REFERENCES cuentas(id),
  tipo TEXT CHECK (tipo IN ('basico', 'estandar', 'premium')),
  activa BOOLEAN DEFAULT TRUE,
  iniciada_en TIMESTAMP DEFAULT NOW(),
  expira_en TIMESTAMP
);

-- Tabla: perfiles
CREATE TABLE perfiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_id UUID REFERENCES cuentas(id),
  nombre TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('viewer', 'child')),
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: titulos
CREATE TABLE titulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria TEXT,
  edad_minima INTEGER DEFAULT 0,
  tipo TEXT CHECK (tipo IN ('pelicula', 'serie', 'documental')),
  descripcion TEXT,
  url_video TEXT,
  imagen_portada TEXT,
  visible BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  publicado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: favoritos
CREATE TABLE favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES perfiles(id),
  titulo_id UUID REFERENCES titulos(id),
  agregado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: historial_visualizacion
CREATE TABLE historial_visualizacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES perfiles(id),
  titulo_id UUID REFERENCES titulos(id),
  visto_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: reseñas
CREATE TABLE reseñas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES perfiles(id),
  titulo_id UUID REFERENCES titulos(id),
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  creada_en TIMESTAMP DEFAULT NOW()
);

-- Datos de ejemplo para titulos
INSERT INTO titulos (nombre, categoria, edad_minima, tipo, descripcion, url_video, imagen_portada, visible) VALUES
('Spider-Man: No Way Home', 'Acción', 13, 'pelicula', 'Peter Parker debe enfrentarse a villanos de universos alternativos.', 'https://example.com/spiderman-trailer.mp4', 'https://example.com/spiderman-poster.jpg', true),
('The Mandalorian', 'Ciencia Ficción', 10, 'serie', 'Un cazarrecompensas mandaloriano navega por la galaxia después de la caída del Imperio.', 'https://example.com/mandalorian-trailer.mp4', 'https://example.com/mandalorian-poster.jpg', true),
('Dune', 'Ciencia Ficción', 13, 'pelicula', 'Paul Atreides debe navegar por la política peligrosa del planeta Arrakis.', 'https://example.com/dune-trailer.mp4', 'https://example.com/dune-poster.jpg', true),
('Stranger Things', 'Terror', 14, 'serie', 'Un grupo de niños descubre fenómenos sobrenaturales en su pequeño pueblo.', 'https://example.com/stranger-things-trailer.mp4', 'https://example.com/stranger-things-poster.jpg', true),
('Top Gun: Maverick', 'Acción', 13, 'pelicula', 'Pete "Maverick" Mitchell regresa como instructor de pilotos de élite.', 'https://example.com/topgun-trailer.mp4', 'https://example.com/topgun-poster.jpg', true),
('The Crown', 'Drama', 12, 'serie', 'La historia de la reina Isabel II y la familia real británica.', 'https://example.com/crown-trailer.mp4', 'https://example.com/crown-poster.jpg', true);

-- ==================================================
-- SINCRONIZACIÓN AUTOMÁTICA CON AUTH.USERS
-- ==================================================

-- Función para crear cuenta cuando se registra un usuario
CREATE OR REPLACE FUNCTION crear_cuenta_desde_auth()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cuentas (id, nombre, apellido, correo, rol, creada_en)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    'usuario',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta cuando se crea un usuario en auth.users
CREATE OR REPLACE TRIGGER trigger_crear_cuenta
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION crear_cuenta_desde_auth();

-- Función para actualizar cuenta cuando se actualiza un usuario
CREATE OR REPLACE FUNCTION actualizar_cuenta_desde_auth()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.cuentas
  SET
    nombre = COALESCE(NEW.raw_user_meta_data->>'first_name', OLD.raw_user_meta_data->>'first_name', nombre),
    apellido = COALESCE(NEW.raw_user_meta_data->>'last_name', OLD.raw_user_meta_data->>'last_name', apellido),
    correo = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta cuando se actualiza un usuario en auth.users
CREATE OR REPLACE TRIGGER trigger_actualizar_cuenta
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_cuenta_desde_auth();

-- ==================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ==================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE titulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_visualizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseñas ENABLE ROW LEVEL SECURITY;

-- Políticas para cuentas
CREATE POLICY "Los usuarios pueden ver su propia cuenta" ON cuentas
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propia cuenta" ON cuentas
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para titulos (lectura pública)
CREATE POLICY "Permitir lectura pública de títulos visibles" ON titulos
  FOR SELECT USING (visible = true);

-- Políticas para perfiles
CREATE POLICY "Los usuarios pueden ver sus propios perfiles" ON perfiles
  FOR ALL USING (cuenta_id = auth.uid());

-- Políticas para favoritos
CREATE POLICY "Los usuarios pueden gestionar sus favoritos" ON favoritos
  FOR ALL USING (EXISTS (
    SELECT 1 FROM perfiles WHERE perfiles.id = favoritos.perfil_id AND perfiles.cuenta_id = auth.uid()
  ));

-- Políticas para historial
CREATE POLICY "Los usuarios pueden ver su historial" ON historial_visualizacion
  FOR ALL USING (EXISTS (
    SELECT 1 FROM perfiles WHERE perfiles.id = historial_visualizacion.perfil_id AND perfiles.cuenta_id = auth.uid()
  ));

-- Políticas para reseñas
CREATE POLICY "Los usuarios pueden gestionar sus reseñas" ON reseñas
  FOR ALL USING (EXISTS (
    SELECT 1 FROM perfiles WHERE perfiles.id = reseñas.perfil_id AND perfiles.cuenta_id = auth.uid()
  ));

-- ==================================================
-- FUNCIÓN PARA OBTENER USUARIO CON ROL
-- ==================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION obtener_rol_usuario()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT rol INTO user_role
  FROM cuentas
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'usuario');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;