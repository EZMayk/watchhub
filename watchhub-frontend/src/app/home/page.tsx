// app/home/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TrailerCard from '@/components/TrailerCard'

export default function InicioPage() {
  const [trailers, setTrailers] = useState<any[]>([])

  useEffect(() => {
    const fetchTrailers = async () => {
      const { data, error } = await supabase
        .from('titulos')
        .select('*')
        .eq('visible', true)
      if (!error) setTrailers(data)
    }
    fetchTrailers()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold text-center my-8">Bienvenido a WatchHub</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {trailers.map((titulo) => (
          <TrailerCard key={titulo.id} titulo={titulo} />
        ))}
      </div>
    </div>
  )
}
