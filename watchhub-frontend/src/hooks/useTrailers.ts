import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTrailers() {
  const [trailers, setTrailers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTrailers = async () => {
    try {
      setError('')
      setLoading(true)
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .eq('visible', true)
        .limit(6)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      setTrailers(data || [])
    } catch (error: any) {
      console.error('Error fetching trailers:', error)
      setError('Error al cargar los trailers. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrailers()
  }, [])

  const retryFetch = () => {
    fetchTrailers()
  }

  const dismissError = () => {
    setError('')
  }

  return {
    trailers,
    loading,
    error,
    retryFetch,
    dismissError
  }
}
