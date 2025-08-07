# 🎬 WatchHub - Plataforma de Streaming

WatchHub es una plataforma moderna de streaming construida con Next.js 15, React 19, Supabase y TypeScript. Ofrece una experiencia similar a Netflix con gestión de contenido, autenticación de usuarios y roles administrativos.

## ✨ Características
hola
- 🎥 **Gestión de Contenido**: Administra películas, series y documentales
- 👤 **Autenticación**: Sistema completo con roles de usuario/admin
- 🎨 **Diseño Moderno**: Interfaz estilo Netflix con Tailwind CSS
- 📱 **Responsive**: Funciona en todos los dispositivos
- 🔐 **Seguridad**: Row Level Security (RLS) con Supabase
- ⚡ **Performance**: Optimizado con Next.js 15 y React 19

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Cuenta en [Supabase](https://supabase.com)

### Instalación

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd watchhub-frontend
```

2. **Instala las dependencias**
```bash
npm install
# o
yarn install
```

3. **Configura las variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

4. **Configura la base de datos**
   - Ve a tu proyecto de Supabase
   - Ejecuta el script SQL desde `database/script.sql`
   - Ejecuta también `database/storage-setup.sql` para configurar el almacenamiento
   - Asegúrate de que las políticas RLS estén habilitadas

5. **Ejecuta el servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 🔧 Solución de Problemas de Conectividad

Si experimentas errores como `net::ERR_NAME_NOT_RESOLVED` o `Failed to fetch`:

### 1. Verifica las Variables de Entorno
```bash
# Asegúrate de que estén configuradas correctamente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Verifica tu Proyecto de Supabase
- Confirma que el proyecto esté activo en [supabase.com/dashboard](https://supabase.com/dashboard)
- Verifica que la URL sea correcta
- Asegúrate de que las políticas RLS permitan acceso

### 3. Problemas de Red
- Verifica tu conexión a internet
- Desactiva temporalmente VPN/proxy
- Reinicia el servidor de desarrollo

### 4. Cache del Navegador
```bash
# Limpia el cache del navegador o usa modo incógnito
# O reinicia el servidor
npm run dev
```

## � Gestión de Archivos (Storage)

WatchHub incluye un sistema completo de gestión de archivos usando Supabase Storage:

### 🖼️ **Imágenes de Portada**
- Subida automática al bucket `media/posters/`
- Compresión y optimización automática
- URLs públicas generadas automáticamente
- Fallback cuando las imágenes no cargan

### 🎬 **Videos**
- Almacenamiento en `media/videos/` 
- Compatible con archivos grandes
- Streaming directo desde Supabase
- También soporta URLs externas (YouTube, Vimeo)

### 🔧 **Configuración del Storage**
1. Ejecuta `database/storage-setup.sql` en tu proyecto Supabase
2. Esto creará:
   - Bucket `media` público
   - Políticas de seguridad apropiadas
   - Funciones auxiliares para gestión

### 💡 **Uso Automático**
Cuando agregues un título:
1. **Sube la imagen** → Se guarda en Storage → URL se guarda en `imagen_portada`
2. **Sube el video** → Se guarda en Storage → URL se guarda en `url_video`  
3. **Los cambios aparecen inmediatamente** en el panel admin (tiempo real)
4. **Las imágenes se muestran** automáticamente en la lista

## 🔄 Actualizaciones en Tiempo Real

La página del admin se actualiza automáticamente cuando:
- ✅ **Agregas un nuevo título** → Aparece inmediatamente en la lista
- ✅ **Editas un título** → Los cambios se reflejan al instante
- ✅ **Eliminas un título** → Se quita de la lista automáticamente
- ✅ **Cambias visibilidad** → El estado se actualiza en vivo
- ✅ **Subes archivos** → Las URLs se actualizan instantáneamente

**No necesitas recargar la página** - todo funciona en tiempo real usando Supabase Realtime.

## �📂 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel administrativo
│   ├── auth/              # Autenticación
│   └── pages/             # Páginas públicas
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI
│   └── admin/            # Componentes admin
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
├── middleware/           # Middleware de autenticación
└── styles/              # Estilos CSS
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run test         # Tests
npm run test:watch   # Tests en modo watch
```

## 🎯 Funcionalidades Principales

### Panel de Administración
- Dashboard con estadísticas en tiempo real
- Gestión de títulos (CRUD completo)
- Subida de archivos a Supabase Storage
- Control de visibilidad
- Vista previa de videos
- Filtrado y búsqueda avanzada
- **Actualizaciones automáticas**: Los cambios se reflejan inmediatamente sin recargar

### Autenticación
- Registro y login
- Roles de usuario/admin
- Protección de rutas
- Sesiones persistentes

### Experiencia de Usuario
- Exploración de contenido
- Categorización por tipo
- Diseño responsive
- Animaciones fluidas

## 🐛 Depuración

### Errores Comunes

1. **Error de conexión a Supabase**
   - Verifica las variables de entorno
   - Confirma que el proyecto esté activo
   - Revisa las políticas RLS

2. **Errores de TypeScript**
   - Ejecuta `npm run build` para verificar
   - Revisa los tipos en `src/types/`

3. **Problemas de importación**
   - Verifica las rutas en `tsconfig.json`
   - Confirma que los componentes existan

### Logs de Desarrollo
```bash
# Para ver logs detallados
npm run dev -- --turbo
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno
3. Despliega automáticamente

### Otras Plataformas
- Netlify
- AWS Amplify
- Railway
- Heroku

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:
1. Revisa la sección de [solución de problemas](#-solución-de-problemas-de-conectividad)
2. Busca en los [issues existentes](../../issues)
3. Crea un nuevo issue con detalles del problema

---

Desarrollado con ❤️ usando Next.js, React y Supabase
