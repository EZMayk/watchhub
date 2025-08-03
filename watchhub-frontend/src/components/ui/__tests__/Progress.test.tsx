import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Progress } from '../Progress'

describe('Progress', () => {
  it('renderiza correctamente', () => {
    render(<Progress value={50} />)
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('muestra el valor correcto', () => {
    render(<Progress value={75} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '75')
  })

  it('aplica el valor máximo correcto', () => {
    render(<Progress value={50} max={200} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuemax', '200')
  })

  it('aplica clases personalizadas', () => {
    render(<Progress value={50} className="custom-progress" />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('custom-progress')
  })

  it('maneja el evento onClick', () => {
    const handleClick = jest.fn()
    render(<Progress value={50} onClick={handleClick} />)
    
    const progressBar = screen.getByRole('progressbar')
    fireEvent.click(progressBar)
    
    expect(handleClick).toHaveBeenCalled()
  })

  it('maneja el ref correctamente', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Progress ref={ref} value={50} />)
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('pasa props adicionales', () => {
    render(<Progress value={50} data-testid="custom-progress" />)
    
    expect(screen.getByTestId('custom-progress')).toBeInTheDocument()
  })

  it('maneja valor 0', () => {
    render(<Progress value={0} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('maneja valor 100', () => {
    render(<Progress value={100} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })

  it('maneja valor negativo', () => {
    render(<Progress value={-10} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '-10')
  })

  it('maneja valor mayor a 100', () => {
    render(<Progress value={150} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '150')
  })

  it('aplica el valor por defecto', () => {
    render(<Progress />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('aplica el max por defecto', () => {
    render(<Progress value={50} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('maneja el estado indeterminado', () => {
    render(<Progress value={undefined} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('maneja el estado de carga', () => {
    render(<Progress value={50} className="animate-pulse" />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('animate-pulse')
  })

  it('maneja diferentes tamaños', () => {
    const { rerender } = render(<Progress value={50} className="h-1" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-1')

    rerender(<Progress value={50} className="h-2" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-2')

    rerender(<Progress value={50} className="h-4" />)
    expect(screen.getByRole('progressbar')).toHaveClass('h-4')
  })

  it('maneja diferentes colores', () => {
    const { rerender } = render(<Progress value={50} className="bg-red-500" />)
    expect(screen.getByRole('progressbar')).toHaveClass('bg-red-500')

    rerender(<Progress value={50} className="bg-green-500" />)
    expect(screen.getByRole('progressbar')).toHaveClass('bg-green-500')

    rerender(<Progress value={50} className="bg-blue-500" />)
    expect(screen.getByRole('progressbar')).toHaveClass('bg-blue-500')
  })

  it('maneja el evento onMouseEnter', () => {
    const handleMouseEnter = jest.fn()
    render(<Progress value={50} onMouseEnter={handleMouseEnter} />)
    
    const progressBar = screen.getByRole('progressbar')
    fireEvent.mouseEnter(progressBar)
    
    expect(handleMouseEnter).toHaveBeenCalled()
  })

  it('maneja el evento onMouseLeave', () => {
    const handleMouseLeave = jest.fn()
    render(<Progress value={50} onMouseLeave={handleMouseLeave} />)
    
    const progressBar = screen.getByRole('progressbar')
    fireEvent.mouseLeave(progressBar)
    
    expect(handleMouseLeave).toHaveBeenCalled()
  })

  it('maneja el evento onFocus', () => {
    const handleFocus = jest.fn()
    render(<Progress value={50} onFocus={handleFocus} />)
    
    const progressBar = screen.getByRole('progressbar')
    fireEvent.focus(progressBar)
    
    expect(handleFocus).toHaveBeenCalled()
  })

  it('maneja el evento onBlur', () => {
    const handleBlur = jest.fn()
    render(<Progress value={50} onBlur={handleBlur} />)
    
    const progressBar = screen.getByRole('progressbar')
    fireEvent.blur(progressBar)
    
    expect(handleBlur).toHaveBeenCalled()
  })
}) 