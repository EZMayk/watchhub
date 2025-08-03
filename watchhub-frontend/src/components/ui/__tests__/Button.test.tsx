import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../Button'
import { Play } from 'lucide-react'

describe('Button', () => {
  it('renderiza correctamente con texto', () => {
    render(<Button>Test Button</Button>)
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('renderiza correctamente con icono', () => {
    render(<Button icon={<Play data-testid="play-icon" />}>Test Button</Button>)
    expect(screen.getByText('Test Button')).toBeInTheDocument()
    expect(screen.getByTestId('play-icon')).toBeInTheDocument()
  })

  it('renderiza correctamente con icono a la derecha', () => {
    render(
      <Button icon={<Play data-testid="play-icon" />} iconPosition="right">
        Test Button
      </Button>
    )
    expect(screen.getByText('Test Button')).toBeInTheDocument()
    expect(screen.getByTestId('play-icon')).toBeInTheDocument()
  })

  it('maneja el evento onClick', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Test Button</Button>)
    
    fireEvent.click(screen.getByText('Test Button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('aplica las variantes correctas', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByText('Default')).toHaveClass('bg-red-600')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByText('Outline')).toHaveClass('border')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByText('Ghost')).toHaveClass('hover:bg-gray-800')

    rerender(<Button variant="gradient">Gradient</Button>)
    expect(screen.getByText('Gradient')).toHaveClass('bg-gradient-to-r')
  })

  it('aplica los tamaños correctos', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByText('Small')).toHaveClass('h-8', 'px-3', 'text-xs')

    rerender(<Button size="default">Default</Button>)
    expect(screen.getByText('Default')).toHaveClass('h-10', 'px-4', 'py-2')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByText('Large')).toHaveClass('h-12', 'px-8', 'text-lg')

    rerender(<Button size="xl">Extra Large</Button>)
    expect(screen.getByText('Extra Large')).toHaveClass('h-14', 'px-10', 'text-xl')
  })

  it('aplica clases personalizadas', () => {
    render(<Button className="custom-class">Test Button</Button>)
    expect(screen.getByText('Test Button')).toHaveClass('custom-class')
  })

  it('deshabilita el botón cuando disabled es true', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
    
    const button = screen.getByText('Disabled Button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('deshabilita el botón cuando loading es true', () => {
    const handleClick = jest.fn()
    render(<Button loading onClick={handleClick}>Loading Button</Button>)
    
    const button = screen.getByText('Loading Button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('muestra el spinner cuando loading es true', () => {
    render(<Button loading>Loading Button</Button>)
    
    const spinner = screen.getByRole('button').querySelector('svg')
    expect(spinner).toBeInTheDocument()
  })

  it('no muestra el icono cuando loading es true', () => {
    render(<Button loading icon={<Play data-testid="play-icon" />}>Loading Button</Button>)
    
    expect(screen.queryByTestId('play-icon')).not.toBeInTheDocument()
  })

  it('renderiza como botón por defecto', () => {
    render(<Button>Regular Button</Button>)
    const button = screen.getByText('Regular Button')
    expect(button.tagName).toBe('BUTTON')
  })

  it('pasa props adicionales al botón', () => {
    render(<Button data-testid="custom-button">Test Button</Button>)
    
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
  })

  it('maneja el ref correctamente', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Test Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
}) 