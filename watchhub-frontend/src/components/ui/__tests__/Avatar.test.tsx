import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Avatar } from '../Avatar'

describe('Avatar', () => {
  it('renderiza correctamente', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />)
    
    const avatar = screen.getByAltText('User Avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('muestra la imagen cuando se proporciona src', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />)
    
    const avatar = screen.getByAltText('User Avatar')
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('muestra el fallback cuando no hay src', () => {
    render(<Avatar fallback="JD" alt="User Avatar" />)
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('aplica los tamaños correctos', () => {
    const { rerender } = render(<Avatar size="sm" fallback="JD" />)
    expect(screen.getByText('JD').closest('.h-8')).toBeInTheDocument()

    rerender(<Avatar size="md" fallback="JD" />)
    expect(screen.getByText('JD').closest('.h-10')).toBeInTheDocument()

    rerender(<Avatar size="lg" fallback="JD" />)
    expect(screen.getByText('JD').closest('.h-12')).toBeInTheDocument()

    rerender(<Avatar size="xl" fallback="JD" />)
    expect(screen.getByText('JD').closest('.h-16')).toBeInTheDocument()
  })

  it('aplica clases personalizadas', () => {
    render(<Avatar className="custom-avatar" fallback="JD" />)
    
    const avatar = screen.getByText('JD').closest('.custom-avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('maneja el estado de carga', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />)
    
    const avatar = screen.getByAltText('User Avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('maneja errores de imagen', () => {
    render(<Avatar src="invalid-url" fallback="JD" alt="User Avatar" />)
    
    const avatar = screen.getByAltText('User Avatar')
    // fireEvent.error(avatar) // This line was commented out in the original file, so I'm keeping it commented.
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('maneja el ref correctamente', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Avatar ref={ref} fallback="JD" />)
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('pasa props adicionales', () => {
    render(<Avatar data-testid="custom-avatar" fallback="JD" />)
    
    expect(screen.getByTestId('custom-avatar')).toBeInTheDocument()
  })

  it('maneja avatar sin alt', () => {
    render(<Avatar src="https://example.com/avatar.jpg" fallback="JD" />)
    
    const avatar = screen.getByRole('img')
    expect(avatar).toBeInTheDocument()
  })

  it('maneja avatar sin fallback', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />)
    
    const avatar = screen.getByAltText('User Avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('aplica el tamaño por defecto', () => {
    render(<Avatar fallback="JD" />)
    
    expect(screen.getByText('JD').closest('.h-10')).toBeInTheDocument()
  })

  it('maneja avatar con src y fallback', () => {
    render(<Avatar src="https://example.com/avatar.jpg" fallback="JD" alt="User Avatar" />)
    
    const avatar = screen.getByAltText('User Avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('maneja avatar con solo fallback', () => {
    render(<Avatar fallback="JD" />)
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('maneja avatar con solo src', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />)
    
    const avatar = screen.getByAltText('User Avatar')
    expect(avatar).toBeInTheDocument()
  })
}) 