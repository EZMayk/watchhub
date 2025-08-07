'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface VideoPlayerContextType {
  activeVideoId: string | null
  setActiveVideo: (videoId: string | null) => void
  isVideoActive: (videoId: string) => boolean
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined)

interface VideoPlayerProviderProps {
  children: ReactNode
}

export function VideoPlayerProvider({ children }: VideoPlayerProviderProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const setActiveVideo = (videoId: string | null) => {
    setActiveVideoId(videoId)
  }

  const isVideoActive = (videoId: string) => {
    return activeVideoId === videoId
  }

  return (
    <VideoPlayerContext.Provider value={{
      activeVideoId,
      setActiveVideo,
      isVideoActive
    }}>
      {children}
    </VideoPlayerContext.Provider>
  )
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext)
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider')
  }
  return context
}
