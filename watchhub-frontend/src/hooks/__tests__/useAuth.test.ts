import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('inicializa con estado de carga', () => {
    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: null }
    })

    const { supabase } = require('@/lib/supabase')
    supabase.auth.getSession = mockGetSession
    supabase.auth.onAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))

    const { result } = renderHook(() => useAuth())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('maneja la sesión inicial correctamente', async () => {
    const mockSession = {
      user: { id: '1', email: 'test@example.com' },
      access_token: 'token',
      refresh_token: 'refresh'
    }

    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: mockSession }
    })

    const { supabase } = require('@/lib/supabase')
    supabase.auth.getSession = mockGetSession
    supabase.auth.onAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      // Esperar a que se complete la inicialización
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(mockGetSession).toHaveBeenCalled()
  })

  it('maneja el signOut correctamente', async () => {
    const mockSignOut = jest.fn().mockResolvedValue({ error: null })

    const { supabase } = require('@/lib/supabase')
    supabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null }
    })
    supabase.auth.onAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
    supabase.auth.signOut = mockSignOut

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('maneja resetPassword correctamente', async () => {
    const mockResetPassword = jest.fn().mockResolvedValue({ error: null })

    const { supabase } = require('@/lib/supabase')
    supabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null }
    })
    supabase.auth.onAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
    supabase.auth.resetPasswordForEmail = mockResetPassword

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.resetPassword('test@example.com')
    })

    expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', {
      redirectTo: expect.stringContaining('/auth/reset-password')
    })
  })

  it('maneja errores de resetPassword', async () => {
    const mockResetPassword = jest.fn().mockResolvedValue({
      error: { message: 'Reset password failed' }
    })

    const { supabase } = require('@/lib/supabase')
    supabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null }
    })
    supabase.auth.onAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
    supabase.auth.resetPasswordForEmail = mockResetPassword

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.resetPassword('test@example.com')
      expect(response.error.message).toBe('Reset password failed')
    })
  })

  it('escucha cambios en el estado de autenticación', async () => {
    const mockOnAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))

    const { supabase } = require('@/lib/supabase')
    supabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null }
    })
    supabase.auth.onAuthStateChange = mockOnAuthStateChange

    renderHook(() => useAuth())

    expect(mockOnAuthStateChange).toHaveBeenCalled()
  })
}) 