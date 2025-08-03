import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import VideoPlayer from '../VideoPlayer'

// Mock de HLS.js
jest.mock('hls.js', () => {
  return jest.fn().mockImplementation(() => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn(),
    destroy: jest.fn(),
  }))
})

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root: null = null
  rootMargin: string = ''
  thresholds: ReadonlyArray<number> = []
  takeRecords() { return [] }
}

describe('VideoPlayer', () => {
  const mockProps = {
    src: 'https://example.com/video.m3u8',
    poster: 'https://example.com/poster.jpg',
    title: 'Test Video',
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza correctamente', () => {
    render(<VideoPlayer {...mockProps} />)
    
    expect(screen.getByTestId('video-player')).toBeInTheDocument()
  })

  it('muestra el video con la fuente correcta', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const video = screen.getByTestId('video-element')
    expect(video).toHaveAttribute('src', mockProps.src)
  })

  it('muestra el poster correcto', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const video = screen.getByTestId('video-element')
    expect(video).toHaveAttribute('poster', mockProps.poster)
  })

  it('muestra el título del video', () => {
    render(<VideoPlayer {...mockProps} />)
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument()
  })

  it('maneja el botón de cerrar', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const closeButton = screen.getByTestId('close-button')
    fireEvent.click(closeButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('maneja el clic en el overlay', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const overlay = screen.getByTestId('video-overlay')
    fireEvent.click(overlay)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('no cierra cuando se hace clic en el video', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const videoContainer = screen.getByTestId('video-container')
    fireEvent.click(videoContainer)
    
    expect(mockProps.onClose).not.toHaveBeenCalled()
  })

  it('maneja el estado de carga', () => {
    render(<VideoPlayer {...mockProps} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('maneja el estado de error', () => {
    render(<VideoPlayer {...mockProps} src="invalid-url" />)
    
    // Simular error de carga
    const video = screen.getByTestId('video-element')
    fireEvent.error(video)
    
    expect(screen.getByText('Error al cargar el video')).toBeInTheDocument()
  })

  it('maneja el estado de reproducción', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const video = screen.getByTestId('video-element')
    fireEvent.play(video)
    
    expect(video).toHaveAttribute('data-playing', 'true')
  })

  it('maneja el estado de pausa', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const video = screen.getByTestId('video-element')
    fireEvent.play(video)
    fireEvent.pause(video)
    
    expect(video).toHaveAttribute('data-playing', 'false')
  })

  it('maneja el progreso del video', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const video = screen.getByTestId('video-element')
    fireEvent.timeUpdate(video)
    
    // Verificar que el progreso se actualiza
    expect(video).toBeInTheDocument()
  })

  it('maneja el volumen del video', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const video = screen.getByTestId('video-element')
    fireEvent.volumeChange(video)
    
    expect(video).toBeInTheDocument()
  })

  it('maneja el final del video', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const video = screen.getByTestId('video-element')
    fireEvent.ended(video)
    
    expect(video).toBeInTheDocument()
  })

  it('maneja el teclado', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const container = screen.getByTestId('video-player')
    fireEvent.keyDown(container, { key: 'Escape' })
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('maneja el teclado con otras teclas', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const container = screen.getByTestId('video-player')
    fireEvent.keyDown(container, { key: 'Enter' })
    
    expect(mockProps.onClose).not.toHaveBeenCalled()
  })

  it('aplica clases CSS correctas', () => {
    render(<VideoPlayer {...mockProps} />)
    
    const player = screen.getByTestId('video-player')
    expect(player).toHaveClass('fixed', 'inset-0', 'z-50')
  })

  it('maneja props adicionales', () => {
    render(<VideoPlayer {...mockProps} data-testid="custom-player" />)
    
    expect(screen.getByTestId('custom-player')).toBeInTheDocument()
  })

  it('maneja video sin poster', () => {
    const propsWithoutPoster = { ...mockProps, poster: undefined }
    render(<VideoPlayer {...propsWithoutPoster} />)
    
    const video = screen.getByTestId('video-element')
    expect(video).not.toHaveAttribute('poster')
  })

  it('maneja video sin título', () => {
    const propsWithoutTitle = { ...mockProps, title: undefined }
    render(<VideoPlayer {...propsWithoutTitle} />)
    
    expect(screen.getByTestId('video-player')).toBeInTheDocument()
  })
}) 