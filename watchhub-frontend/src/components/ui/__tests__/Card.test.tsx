import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card, CardContent } from '../Card'

describe('Card', () => {
  it('renderiza correctamente con contenido básico', () => {
    render(
      <Card>
        <CardContent>
          <p>Test content</p>
        </CardContent>
      </Card>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('aplica las variantes correctas', () => {
    const { rerender } = render(
      <Card variant="default">
        <CardContent>Default Card</CardContent>
      </Card>
    )
    expect(screen.getByText('Default Card').closest('.bg-gray-800')).toBeInTheDocument()

    rerender(
      <Card variant="elevated">
        <CardContent>Elevated Card</CardContent>
      </Card>
    )
    expect(screen.getByText('Elevated Card').closest('.shadow-xl')).toBeInTheDocument()

    rerender(
      <Card variant="glass">
        <CardContent>Glass Card</CardContent>
      </Card>
    )
    expect(screen.getByText('Glass Card').closest('.backdrop-blur-sm')).toBeInTheDocument()

    rerender(
      <Card variant="outline">
        <CardContent>Outline Card</CardContent>
      </Card>
    )
    expect(screen.getByText('Outline Card').closest('.border')).toBeInTheDocument()
  })

  it('aplica el padding correcto', () => {
    const { rerender } = render(
      <Card padding="none">
        <CardContent>No Padding</CardContent>
      </Card>
    )
    expect(screen.getByText('No Padding').closest('.p-0')).toBeInTheDocument()

    rerender(
      <Card padding="sm">
        <CardContent>Small Padding</CardContent>
      </Card>
    )
    expect(screen.getByText('Small Padding').closest('.p-3')).toBeInTheDocument()

    rerender(
      <Card padding="md">
        <CardContent>Medium Padding</CardContent>
      </Card>
    )
    expect(screen.getByText('Medium Padding').closest('.p-6')).toBeInTheDocument()

    rerender(
      <Card padding="lg">
        <CardContent>Large Padding</CardContent>
      </Card>
    )
    expect(screen.getByText('Large Padding').closest('.p-8')).toBeInTheDocument()
  })

  it('aplica clases personalizadas', () => {
    render(
      <Card className="custom-card">
        <CardContent>Custom Card</CardContent>
      </Card>
    )
    expect(screen.getByText('Custom Card').closest('.custom-card')).toBeInTheDocument()
  })

  it('renderiza con contenido complejo', () => {
    render(
      <Card>
        <CardContent>
          <h2>Card Title</h2>
          <p>Card description</p>
          <button>Card Button</button>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Card Button')).toBeInTheDocument()
  })

  it('maneja múltiples CardContent', () => {
    render(
      <Card>
        <CardContent>
          <h3>Header</h3>
        </CardContent>
        <CardContent>
          <p>Body</p>
        </CardContent>
        <CardContent>
          <footer>Footer</footer>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('maneja el ref correctamente', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Card ref={ref}>
        <CardContent>Test Card</CardContent>
      </Card>
    )
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('pasa props adicionales al card', () => {
    render(
      <Card data-testid="custom-card">
        <CardContent>Test Card</CardContent>
      </Card>
    )
    
    expect(screen.getByTestId('custom-card')).toBeInTheDocument()
  })
}) 