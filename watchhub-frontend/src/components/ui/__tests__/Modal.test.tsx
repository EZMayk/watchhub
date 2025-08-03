import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Modal from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza correctamente cuando está abierto', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('no renderiza cuando está cerrado', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('llama a onClose cuando se hace clic en el botón de cerrar', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByLabelText('Cerrar modal')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('llama a onClose cuando se hace clic en el overlay', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    const overlay = screen.getByText('Modal content').closest('.fixed')?.querySelector('.absolute')
    fireEvent.click(overlay!)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no llama a onClose cuando closeOnOverlayClick es false', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />)
    
    const overlay = screen.getByText('Modal content').closest('.fixed')?.querySelector('.absolute')
    fireEvent.click(overlay!)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('aplica los tamaños correctos', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />)
    expect(screen.getByText('Modal content').closest('.max-w-md')).toBeInTheDocument()

    rerender(<Modal {...defaultProps} size="md" />)
    expect(screen.getByText('Modal content').closest('.max-w-lg')).toBeInTheDocument()

    rerender(<Modal {...defaultProps} size="lg" />)
    expect(screen.getByText('Modal content').closest('.max-w-2xl')).toBeInTheDocument()

    rerender(<Modal {...defaultProps} size="xl" />)
    expect(screen.getByText('Modal content').closest('.max-w-4xl')).toBeInTheDocument()

    rerender(<Modal {...defaultProps} size="full" />)
    expect(screen.getByText('Modal content').closest('.max-w-\\[95vw\\]')).toBeInTheDocument()
  })

  it('renderiza sin título', () => {
    render(<Modal {...defaultProps} title={undefined} />)
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renderiza sin botón de cerrar', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />)
    
    expect(screen.queryByLabelText('Cerrar modal')).not.toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renderiza con contenido complejo', () => {
    const complexContent = (
      <div>
        <h2>Complex Title</h2>
        <p>Complex description</p>
        <button>Action Button</button>
      </div>
    )
    
    render(<Modal {...defaultProps} children={complexContent} />)
    
    expect(screen.getByText('Complex Title')).toBeInTheDocument()
    expect(screen.getByText('Complex description')).toBeInTheDocument()
    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('previene la propagación del clic en el contenido del modal', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    const modalContent = screen.getByText('Modal content').closest('.relative')
    fireEvent.click(modalContent!)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('aplica clases personalizadas', () => {
    render(<Modal {...defaultProps} className="custom-modal" />)
    expect(screen.getByText('Modal content').closest('.custom-modal')).toBeInTheDocument()
  })

  it('maneja eventos de teclado', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no cierra con Escape cuando está cerrado', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} isOpen={false} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).not.toHaveBeenCalled()
  })
}) 