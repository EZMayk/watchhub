import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TrailerCard from '../TrailerCard'

const mockTitulo = {
  id: '1',
  nombre: 'Test Movie',
  descripcion: 'This is a test movie description',
  url_poster: 'https://example.com/poster.jpg',
  url_streaming: 'https://example.com/stream.m3u8',
  tipo: 'Película',
  clasificacion_edad: 'PG-13',
  duracion: 120,
  fecha_estreno: '2024-12-25',
  calificacion: 8.5,
}

describe('TrailerCard', () => {
  beforeEach(() => {
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
  })

  it('renderiza correctamente con todos los datos', () => {
    render(<TrailerCard titulo={mockTitulo} />)
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.getByText('This is a test movie description')).toBeInTheDocument()
    expect(screen.getByText('Película')).toBeInTheDocument()
    expect(screen.getByText('PG-13')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('2h 0m')).toBeInTheDocument()
  })

  it('renderiza correctamente con datos mínimos', () => {
    const minimalTitulo = {
      id: '2',
      nombre: 'Minimal Movie',
      descripcion: 'Minimal description',
      url_poster: 'https://example.com/poster.jpg',
      url_streaming: 'https://example.com/stream.m3u8',
      tipo: 'Serie',
    }

    render(<TrailerCard titulo={minimalTitulo} />)
    
    expect(screen.getByText('Minimal Movie')).toBeInTheDocument()
    expect(screen.getByText('Minimal description')).toBeInTheDocument()
    expect(screen.getByText('Serie')).toBeInTheDocument()
  })

  it('muestra el botón de play al hacer hover', () => {
    render(<TrailerCard titulo={mockTitulo} />)
    
    const card = screen.getByText('Test Movie').closest('.group')
    expect(card).toBeInTheDocument()
    
    fireEvent.mouseEnter(card!)
    
    expect(screen.getByText('Ver Trailer')).toBeInTheDocument()
  })

  it('abre el modal al hacer clic en el botón de play', async () => {
    render(<TrailerCard titulo={mockTitulo} />)
    
    const card = screen.getByText('Test Movie').closest('.group')
    fireEvent.mouseEnter(card!)
    
    const playButton = screen.getByText('Ver Trailer')
    fireEvent.click(playButton)
    
    await waitFor(() => {
      // Verificar que el modal se abrió buscando el título en el modal
      const modalTitle = screen.getAllByText('Test Movie')[1] // El segundo elemento es el del modal
      expect(modalTitle).toBeInTheDocument()
    })
  })

  it('formatea correctamente la duración', () => {
    const shortMovie = {
      ...mockTitulo,
      duracion: 45,
    }
    
    render(<TrailerCard titulo={shortMovie} />)
    expect(screen.getByText('45m')).toBeInTheDocument()
  })

  it('formatea correctamente la duración con horas', () => {
    const longMovie = {
      ...mockTitulo,
      duracion: 150,
    }
    
    render(<TrailerCard titulo={longMovie} />)
    expect(screen.getByText('2h 30m')).toBeInTheDocument()
  })

  it('maneja correctamente la imagen del poster', () => {
    render(<TrailerCard titulo={mockTitulo} />)
    
    const posterImage = screen.getByAltText('Test Movie')
    expect(posterImage).toBeInTheDocument()
    expect(posterImage).toHaveAttribute('src', 'https://example.com/poster.jpg')
  })

  it('aplica las clases CSS correctas', () => {
    render(<TrailerCard titulo={mockTitulo} />)
    
    const card = screen.getByText('Test Movie').closest('.group')
    expect(card).toHaveClass('group', 'cursor-pointer', 'transition-all', 'duration-300')
  })

  it('maneja trailers sin clasificación de edad', () => {
    const tituloSinClasificacion = {
      ...mockTitulo,
      clasificacion_edad: undefined,
    }
    
    render(<TrailerCard titulo={tituloSinClasificacion} />)
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.queryByText('PG-13')).not.toBeInTheDocument()
  })

  it('maneja trailers sin calificación', () => {
    const tituloSinCalificacion = {
      ...mockTitulo,
      calificacion: undefined,
    }
    
    render(<TrailerCard titulo={tituloSinCalificacion} />)
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.queryByText('8.5')).not.toBeInTheDocument()
  })

  it('maneja trailers sin fecha de estreno', () => {
    const tituloSinFecha = {
      ...mockTitulo,
      fecha_estreno: undefined,
    }
    
    render(<TrailerCard titulo={tituloSinFecha} />)
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.queryByText('2024')).not.toBeInTheDocument()
  })

  it('maneja trailers sin duración', () => {
    const tituloSinDuracion = {
      ...mockTitulo,
      duracion: undefined,
    }
    
    render(<TrailerCard titulo={tituloSinDuracion} />)
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
    expect(screen.queryByText('2h 0m')).not.toBeInTheDocument()
  })

  it('formatea correctamente la fecha de estreno', () => {
    const tituloConFecha = {
      ...mockTitulo,
      fecha_estreno: '2023-12-25',
    }
    
    render(<TrailerCard titulo={tituloConFecha} />)
    expect(screen.getByText('2023')).toBeInTheDocument()
  })
}) 