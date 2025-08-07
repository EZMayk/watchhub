'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface UserAccount {
  id: string
  nombre: string
  apellido: string
  correo: string
  rol: 'usuario' | 'admin'
  creada_en: string
}

interface ExtendedUser extends User {
  account?: UserAccount | null
}

export function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const fetchUserAccount = async (userId: string): Promise<UserAccount | null> => {
    try {
      const { data, error } = await supabase
        .from('cuentas')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user account:', error)
        
        // Si es un error de RLS, intentar usar RPC
        if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
          console.log('Attempting RPC fallback for user account')
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_role', { user_id: userId })
          
          if (!rpcError && rpcData) {
            // Crear un objeto usuario básico con el rol obtenido
            return {
              id: userId,
              nombre: 'Admin',
              apellido: 'User',
              correo: 'admin@watchhub.com',
              rol: rpcData as 'usuario' | 'admin',
              creada_en: new Date().toISOString()
            }
          }
        }
        
        setAuthError('Error al cargar la información del usuario')
        return null
      }

      setAuthError(null)
      return data as UserAccount
    } catch (error) {
      console.error('Error in fetchUserAccount:', error)
      setAuthError('Error de conexión')
      return null
    }
  }

  const handleAuthStateChange = useCallback(async (session: Session | null) => {
    setSession(session)
    
    if (session?.user) {
      const account = await fetchUserAccount(session.user.id)
      setUserAccount(account)
      setUser({ ...session.user, account })
    } else {
      setUser(null)
      setUserAccount(null)
      setAuthError(null)
    }
    
    setLoading(false)
  }, []) // fetchUserAccount es estable, no necesita dependencias

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthError('Error de autenticación')
          setLoading(false)
          return
        }

        await handleAuthStateChange(session)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setAuthError('Error al inicializar la sesión')
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth state changed:', event, session?.user?.email)
        }
        await handleAuthStateChange(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [handleAuthStateChange])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserAccount(null)
  }

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
  }

  const updateUserRole = async (userId: string, newRole: 'usuario' | 'admin') => {
    if (userAccount?.rol !== 'admin') {
      throw new Error('No tienes permisos para cambiar roles')
    }

    const { error } = await supabase
      .from('cuentas')
      .update({ rol: newRole })
      .eq('id', userId)

    if (error) throw error

    // Actualizar datos locales si es el usuario actual
    if (userId === user?.id) {
      const updatedAccount = { ...userAccount, rol: newRole }
      setUserAccount(updatedAccount)
      setUser({ ...user, account: updatedAccount })
    }
  }

  const isAdmin = (): boolean => {
    return userAccount?.rol === 'admin'
  }

  const isAuthenticated = (): boolean => {
    return !!user && !!session
  }

  const hasRole = (role: 'usuario' | 'admin'): boolean => {
    return userAccount?.rol === role
  }

  return {
    user,
    session,
    loading,
    userAccount,
    authError,
    signOut,
    resetPassword,
    updateUserRole,
    isAdmin,
    isAuthenticated,
    hasRole,
    refreshUserAccount: () => user?.id ? fetchUserAccount(user.id) : Promise.resolve(null)
  }
}