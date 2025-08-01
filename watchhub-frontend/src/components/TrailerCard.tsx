// components/TrailerCard.tsx
'use client'
import Hls from 'hls.js'
import { useRef, useEffect, useState } from 'react'

export default function TrailerCard({ titulo }: { titulo: any }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    if (videoRef.current && showPlayer) {
      const hls = new Hls()
      hls.loadSource(titulo.url_streaming)
      hls.attachMedia(videoRef.current)
    }
  }, [showPlayer])

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-md hover:scale-105 transition">
      <img src={titulo.url_poster} alt={titulo.nombre} className="w-full h-48 object-cover" />
      <div className="p-3">
        <h2 className="text-lg font-semibold">{titulo.nombre}</h2>
        <p className="text-sm text-zinc-400">{titulo.descripcion.slice(0, 60)}...</p>
        <button
          onClick={() => setShowPlayer(true)}
          className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 text-sm rounded"
        >
          Ver trailer
        </button>
        {showPlayer && (
          <video ref={videoRef} controls autoPlay className="w-full mt-2 rounded">
            Tu navegador no soporta video.
          </video>
        )}
      </div>
    </div>
  )
}
