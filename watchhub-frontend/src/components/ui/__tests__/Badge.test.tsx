import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renderiza correctamente', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('aplica las variantes correctas', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-red-600')

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-600')

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('border')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toHaveClass('bg-red-600')
  })

  it('aplica los tamaños correctos', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toHaveClass('text-xs')

    rerender(<Badge size="md">Medium</Badge>)
    expect(screen.getByText('Medium')).toHaveClass('text-sm')

    rerender(<Badge size="lg">Large</Badge>)
    expect(screen.getByText('Large')).toHaveClass('text-base')
  })

  it('aplica clases personalizadas', () => {
    render(<Badge className="custom-badge">Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toHaveClass('custom-badge')
  })

  it('renderiza con contenido complejo', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    )
    
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('maneja el ref correctamente', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Badge ref={ref}>Test Badge</Badge>)
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('pasa props adicionales', () => {
    render(<Badge data-testid="custom-badge">Test Badge</Badge>)
    
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
  })
}) 