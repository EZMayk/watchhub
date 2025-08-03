import { renderHook, act } from '@testing-library/react'
import { useTrailers } from '../useTrailers'

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}))

describe('useTrailers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('inicializa con estado correcto', () => {
    const { result } = renderHook(() => useTrailers())
    
    expect(result.current.trailers).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe('')
  })

  it('carga trailers correctamente', async () => {
    const mockTrailers = [
      {
        id: '1',
        nombre: 'Test Movie 1',
        descripcion: 'Description 1',
        url_poster: 'https://example.com/poster1.jpg',
        url_streaming: 'https://example.com/stream1.m3u8',
        tipo: 'Película',
        visible: true,
        fecha_creacion: '2024-01-01',
      },
      {
        id: '2',
        nombre: 'Test Movie 2',
        descripcion: 'Description 2',
        url_poster: 'https://example.com/poster2.jpg',
        url_streaming: 'https://example.com/stream2.m3u8',
        tipo: 'Serie',
        visible: true,
        fecha_creacion: '2024-01-02',
      },
    ]

    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockTrailers,
                error: null,
              })),
            })),
          })),
        })),
      })),
    }

    const { supabase } = require('@/lib/supabase')
    Object.assign(supabase, mockSupabase)

    const { result } = renderHook(() => useTrailers())

    await act(async () => {
      // Esperar a que se complete la carga inicial
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.trailers).toEqual(mockTrailers)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('maneja errores de carga', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => ({
              order: jest.fn(() => ({
                data: null,
                error: { message: 'Database error' },
              })),
            })),
          })),
        })),
      })),
    }

    const { supabase } = require('@/lib/supabase')
    Object.assign(supabase, mockSupabase)

    const { result } = renderHook(() => useTrailers())

    await act(async () => {
      // Esperar a que se complete la carga inicial
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.trailers).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Error al cargar los trailers. Por favor, intenta de nuevo.')
  })

  it('maneja trailers vacíos', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => ({
              order: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      })),
    }

    const { supabase } = require('@/lib/supabase')
    Object.assign(supabase, mockSupabase)

    const { result } = renderHook(() => useTrailers())

    await act(async () => {
      // Esperar a que se complete la carga inicial
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.trailers).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('llama a Supabase con los parámetros correctos', async () => {
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    }))

    const mockSupabase = {
      from: mockFrom,
    }

    const { supabase } = require('@/lib/supabase')
    Object.assign(supabase, mockSupabase)

    renderHook(() => useTrailers())

    await act(async () => {
      // Esperar a que se complete la carga inicial
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(mockFrom).toHaveBeenCalledWith('titulos')
  })

  it('limpia el error al hacer retry', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            limit: jest.fn(() => ({
              order: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      })),
    }

    const { supabase } = require('@/lib/supabase')
    Object.assign(supabase, mockSupabase)

    const { result } = renderHook(() => useTrailers())

    // Simular que hay un error
    act(() => {
      result.current.error = 'Previous error'
    })

    await act(async () => {
      result.current.retryFetch()
    })

    expect(result.current.error).toBe('')
  })

  it('maneja excepciones inesperadas', async () => {
    const mockSupabase = {
      from: jest.fn(() => {
        throw new Error('Unexpected error')
      }),
    }

    const { supabase } = require('@/lib/supabase')
    Object.assign(supabase, mockSupabase)

    const { result } = renderHook(() => useTrailers())

    await act(async () => {
      // Esperar a que se complete la carga inicial
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.error).toBe('Error al cargar los trailers. Por favor, intenta de nuevo.')
    expect(result.current.loading).toBe(false)
  })

  it('dismissError limpia el error', () => {
    const { result } = renderHook(() => useTrailers())

    act(() => {
      result.current.error = 'Some error'
    })

    expect(result.current.error).toBe('Some error')

    act(() => {
      result.current.dismissError()
    })

    expect(result.current.error).toBe('')
  })
}) 