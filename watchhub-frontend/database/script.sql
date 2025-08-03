-- Tabla: cuentas
CREATE TABLE cuentas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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