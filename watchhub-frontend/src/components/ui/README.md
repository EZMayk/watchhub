# Componentes UI de WatchHub

Esta carpeta contiene una biblioteca de componentes reutilizables diseñados específicamente para WatchHub, una plataforma de streaming. Todos los componentes están diseñados con un tema oscuro y utilizan Tailwind CSS.

## Componentes Disponibles

### 🔘 Button
Componente de botón versátil con múltiples variantes y tamaños.

**Props:**
- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient'
- `size`: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
- `loading`: boolean - Muestra un spinner de carga
- `icon`: ReactNode - Icono a mostrar
- `iconPosition`: 'left' | 'right' - Posición del icono

**Ejemplo:**
```tsx
<Button variant="gradient" size="lg" icon={<Play />}>
  Reproducir
</Button>
```

### 📝 Input
Campo de entrada con soporte para iconos, etiquetas y mensajes de error.

**Props:**
- `label`: string - Etiqueta del campo
- `error`: string - Mensaje de error
- `helperText`: string - Texto de ayuda
- `leftIcon`: ReactNode - Icono izquierdo
- `rightIcon`: ReactNode - Icono derecho
- `variant`: 'default' | 'ghost'

**Ejemplo:**
```tsx
<Input
  label="Email"
  leftIcon={<Mail />}
  placeholder="tu@email.com"
  error={errors.email}
/>
```

### 🎴 Card
Contenedor versátil para agrupar contenido relacionado.

**Componentes incluidos:**
- `Card` - Contenedor principal
- `CardHeader` - Encabezado
- `CardTitle` - Título
- `CardDescription` - Descripción
- `CardContent` - Contenido
- `CardFooter` - Pie

**Props de Card:**
- `variant`: 'default' | 'elevated' | 'outline' | 'glass'
- `padding`: 'none' | 'sm' | 'md' | 'lg'

**Ejemplo:**
```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
</Card>
```

### ⚠️ Alert
Componente para mostrar mensajes importantes al usuario.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info'
- `title`: string - Título del alert
- `description`: string - Descripción
- `dismissible`: boolean - Si se puede cerrar
- `onDismiss`: function - Callback al cerrar
- `icon`: ReactNode - Icono personalizado

**Ejemplo:**
```tsx
<Alert
  variant="success"
  title="¡Éxito!"
  description="Tu cuenta ha sido creada correctamente"
  dismissible
  onDismiss={() => setShowAlert(false)}
/>
```

### 🏷️ Badge
Pequeño indicador para mostrar estado o categorías.

**Props:**
- `variant`: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline'
- `size`: 'sm' | 'md' | 'lg'

**Ejemplo:**
```tsx
<Badge variant="success">Nuevo</Badge>
<Badge variant="error" size="sm">Premium</Badge>
```

### 👤 Avatar
Componente para mostrar imágenes de perfil o iniciales.

**Props:**
- `src`: string - URL de la imagen
- `alt`: string - Texto alternativo
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `fallback`: string - Texto de respaldo
- `variant`: 'circle' | 'square'

**AvatarGroup Props:**
- `max`: number - Máximo número de avatares a mostrar

**Ejemplo:**
```tsx
<Avatar src="/avatar.jpg" fallback="JD" size="lg" />

<AvatarGroup max={3}>
  <Avatar src="/user1.jpg" />
  <Avatar src="/user2.jpg" />
  <Avatar src="/user3.jpg" />
  <Avatar src="/user4.jpg" />
</AvatarGroup>
```

### ⏳ LoadingSpinner
Indicador de carga con diferentes estilos.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'default' | 'dots' | 'pulse'
- `text`: string - Texto descriptivo

**Ejemplo:**
```tsx
<LoadingSpinner size="lg" text="Cargando contenido..." />
```

### 📊 Progress
Barra de progreso para mostrar el avance de una tarea.

**Props:**
- `value`: number - Valor actual
- `max`: number - Valor máximo
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'default' | 'success' | 'warning' | 'error'
- `showValue`: boolean - Mostrar porcentaje
- `label`: string - Etiqueta

**Ejemplo:**
```tsx
<Progress 
  value={75} 
  max={100} 
  label="Descarga en progreso" 
  showValue 
/>
```

### 🪟 Modal
Ventana modal para mostrar contenido superpuesto.

**Props:**
- `isOpen`: boolean - Si el modal está abierto
- `onClose`: function - Callback al cerrar
- `title`: string - Título del modal
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean - Cerrar al hacer clic fuera
- `showCloseButton`: boolean - Mostrar botón de cerrar

**Ejemplo:**
```tsx
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Configuración"
  size="lg"
>
  <div className="p-6">
    Contenido del modal
  </div>
</Modal>
```

## Componentes de la Aplicación

### 🎬 TrailerCard
Tarjeta mejorada para mostrar trailers con video integrado.

**Props:**
- `titulo`: Objeto con información del título (nombre, descripción, poster, etc.)

### 🧭 Navbar
Barra de navegación principal con menú responsive.

**Props:**
- `user`: Objeto con información del usuario
- `onLogout`: Callback para cerrar sesión

### 👥 PerfilCard
Tarjeta para mostrar y gestionar perfiles de usuario.

**Props:**
- `profile`: Objeto con información del perfil
- `isAddProfile`: boolean - Si es una tarjeta para agregar perfil
- `onSelect`: Callback al seleccionar perfil
- `onEdit`: Callback al editar perfil
- `onAdd`: Callback al agregar perfil

## Paleta de Colores

El diseño utiliza una paleta de colores oscura:

- **Primario**: Rojo (`red-600`, `red-700`)
- **Secundario**: Púrpura (`purple-600`, `purple-700`)
- **Fondo**: Grises oscuros (`gray-800`, `gray-900`)
- **Texto**: Blanco y grises claros
- **Acentos**: Dorado para ratings, verde para éxito, amarillo para advertencias

## Uso

Todos los componentes se pueden importar desde el archivo índice:

```tsx
import { Button, Card, Alert, Badge } from '@/components/ui'
```

O individualmente:

```tsx
import { Button } from '@/components/ui/Button'
```

## Características

- ✅ **Accesibilidad**: Todos los componentes incluyen atributos ARIA apropiados
- ✅ **Responsive**: Diseñados para funcionar en todos los dispositivos
- ✅ **TypeScript**: Completamente tipados con TypeScript
- ✅ **Tema oscuro**: Optimizados para la experiencia de streaming
- ✅ **Animaciones**: Transiciones suaves y efectos hover
- ✅ **Consistencia**: Diseño uniforme en toda la aplicación

## Personalización

Los componentes pueden personalizarse fácilmente mediante:

1. **Props**: Cada componente acepta props para modificar su apariencia
2. **className**: Se puede pasar clases de Tailwind adicionales
3. **CSS**: Estilos personalizados para casos específicos

¡Estos componentes están listos para usar en toda la aplicación WatchHub!
