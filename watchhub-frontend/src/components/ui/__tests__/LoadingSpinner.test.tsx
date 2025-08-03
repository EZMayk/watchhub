import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renderiza correctamente', () => {
    render(<LoadingSpinner />)
    const container = screen.getByTestId('loading-spinner')
    expect(container).toBeInTheDocument()
  })

  it('muestra el texto de carga', () => {
    render(<LoadingSpinner text="Cargando..." />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('aplica los tamaños correctos', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    const svg = screen.getByTestId('loading-spinner').querySelector('svg')
    expect(svg).toHaveClass('h-4', 'w-4')

    rerender(<LoadingSpinner size="md" />)
    expect(svg).toHaveClass('h-6', 'w-6')

    rerender(<LoadingSpinner size="lg" />)
    expect(svg).toHaveClass('h-8', 'w-8')

    rerender(<LoadingSpinner size="xl" />)
    expect(svg).toHaveClass('h-12', 'w-12')
  })

  it('aplica clases personalizadas', () => {
    render(<LoadingSpinner className="custom-spinner" />)
    const container = screen.getByTestId('loading-spinner')
    expect(container).toHaveClass('custom-spinner')
  })

  it('renderiza sin texto', () => {
    render(<LoadingSpinner />)
    const container = screen.getByTestId('loading-spinner')
    expect(container).toBeInTheDocument()
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
  })

  it('maneja el ref correctamente', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<LoadingSpinner ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('pasa props adicionales', () => {
    render(<LoadingSpinner data-testid="custom-spinner" />)
    
    expect(screen.getByTestId('custom-spinner')).toBeInTheDocument()
  })

  it('renderiza con texto personalizado', () => {
    render(<LoadingSpinner text="Cargando datos..." />)
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
  })
}) 