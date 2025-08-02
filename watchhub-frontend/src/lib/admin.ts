import { supabase } from './supabase'

export interface UserAccountAdmin {
  id: string
  nombre: string
  apellido: string
  correo: string
  rol: 'usuario' | 'admin'
  creada_en: string
  last_sign_in_at?: string
  email_confirmed_at?: string
}

// Obtener todos los usuarios (solo para admins)
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .order('creada_en', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }

  return data
}

// Cambiar rol de usuario (solo para admins)
export const changeUserRole = async (userId: string, newRole: 'usuario' | 'admin') => {
  const { data, error } = await supabase
    .from('cuentas')
    .update({ rol: newRole })
    .eq('id', userId)
    .select()

  if (error) {
    console.error('Error changing user role:', error)
    throw error
  }

  return data
}

// Obtener estadísticas de usuarios
export const getUserStats = async () => {
  // Total de usuarios
  const { count: totalUsers, error: totalError } = await supabase
    .from('cuentas')
    .select('*', { count: 'exact', head: true })

  if (totalError) throw totalError

  // Usuarios admin
  const { count: adminUsers, error: adminError } = await supabase
    .from('cuentas')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'admin')

  if (adminError) throw adminError

  // Usuarios registrados en los últimos 7 días
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: recentUsers, error: recentError } = await supabase
    .from('cuentas')
    .select('*', { count: 'exact', head: true })
    .gte('creada_en', sevenDaysAgo.toISOString())

  if (recentError) throw recentError

  return {
    totalUsers: totalUsers || 0,
    adminUsers: adminUsers || 0,
    regularUsers: (totalUsers || 0) - (adminUsers || 0),
    recentUsers: recentUsers || 0
  }
}

// Obtener contenido más popular
export const getContentStats = async () => {
  // Total de títulos
  const { count: totalTitles, error: titlesError } = await supabase
    .from('titulos')
    .select('*', { count: 'exact', head: true })

  if (titlesError) throw titlesError

  // Títulos visibles
  const { count: visibleTitles, error: visibleError } = await supabase
    .from('titulos')
    .select('*', { count: 'exact', head: true })
    .eq('visible', true)

  if (visibleError) throw visibleError

  return {
    totalTitles: totalTitles || 0,
    visibleTitles: visibleTitles || 0,
    hiddenTitles: (totalTitles || 0) - (visibleTitles || 0)
  }
}

// Verificar si el usuario actual es admin
export const checkAdminPermissions = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  const { data, error } = await supabase
    .from('cuentas')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error checking admin permissions:', error)
    throw error
  }

  if (data.rol !== 'admin') {
    throw new Error('No tienes permisos de administrador')
  }

  return true
}
