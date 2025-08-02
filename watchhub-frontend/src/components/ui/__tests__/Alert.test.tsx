import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Alert } from '../Alert'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

describe('Alert', () => {
  const defaultProps = {
    title: 'Test Alert',
    description: 'This is a test alert',
  }

  it('renderiza correctamente', () => {
    render(<Alert {...defaultProps} />)
    
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
    expect(screen.getByText('This is a test alert')).toBeInTheDocument()
  })

  it('aplica las variantes correctas', () => {
    const { rerender } = render(<Alert {...defaultProps} variant="default" />)
    expect(screen.getByText('Test Alert').closest('.bg-gray-800')).toBeInTheDocument()

    rerender(<Alert {...defaultProps} variant="error" />)
    expect(screen.getByText('Test Alert').closest('.bg-red-900\\/20')).toBeInTheDocument()

    rerender(<Alert {...defaultProps} variant="success" />)
    expect(screen.getByText('Test Alert').closest('.bg-green-900\\/20')).toBeInTheDocument()

    rerender(<Alert {...defaultProps} variant="warning" />)
    expect(screen.getByText('Test Alert').closest('.bg-yellow-900\\/20')).toBeInTheDocument()

    rerender(<Alert {...defaultProps} variant="info" />)
    expect(screen.getByText('Test Alert').closest('.bg-blue-900\\/20')).toBeInTheDocument()
  })

  it('muestra el icono correcto según la variante', () => {
    const { rerender } = render(<Alert {...defaultProps} variant="default" />)
    // El icono está presente pero no tiene data-testid
    expect(screen.getByText('Test Alert')).toBeInTheDocument()

    rerender(<Alert {...defaultProps} variant="error" />)
    expect(screen.getByText('Test Alert')).toBeInTheDocument()

    rerender(<Alert {...defaultProps} variant="success" />)
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
  })

  it('maneja el botón de cerrar', () => {
    const onDismiss = jest.fn()
    render(<Alert {...defaultProps} dismissible onDismiss={onDismiss} />)
    
    const closeButton = screen.getByLabelText('Cerrar alerta')
    fireEvent.click(closeButton)
    
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('no muestra el botón de cerrar cuando no es dismissible', () => {
    render(<Alert {...defaultProps} />)
    
    expect(screen.queryByLabelText('Cerrar alerta')).not.toBeInTheDocument()
  })

  it('aplica clases personalizadas', () => {
    render(<Alert {...defaultProps} className="custom-alert" />)
    expect(screen.getByText('Test Alert').closest('.custom-alert')).toBeInTheDocument()
  })

  it('renderiza sin título', () => {
    render(<Alert description="Only description" />)
    
    expect(screen.queryByText('Test Alert')).not.toBeInTheDocument()
    expect(screen.getByText('Only description')).toBeInTheDocument()
  })

  it('renderiza sin descripción', () => {
    render(<Alert title="Only title" />)
    
    expect(screen.getByText('Only title')).toBeInTheDocument()
    expect(screen.queryByText('This is a test alert')).not.toBeInTheDocument()
  })

  it('renderiza con icono personalizado', () => {
    const CustomIcon = () => <div data-testid="custom-icon">🚀</div>
    render(<Alert {...defaultProps} icon={<CustomIcon />} />)
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renderiza sin icono cuando se pasa null', () => {
    render(<Alert {...defaultProps} icon={null} />)
    
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
    // No debería haber iconos de lucide-react
    expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument()
  })

  it('maneja contenido children', () => {
    render(
      <Alert {...defaultProps}>
        <div data-testid="alert-children">Additional content</div>
      </Alert>
    )
    
    expect(screen.getByTestId('alert-children')).toBeInTheDocument()
    expect(screen.getByText('Additional content')).toBeInTheDocument()
  })
}) 