import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '../Input'

describe('Input', () => {
  it('renderiza correctamente', () => {
    render(<Input placeholder="Test input" />)
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
  })

  it('maneja el evento onChange', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('aplica las variantes correctas', () => {
    const { rerender } = render(<Input variant="default" />)
    expect(screen.getByRole('textbox')).toHaveClass('bg-gray-800')

    rerender(<Input variant="ghost" />)
    expect(screen.getByRole('textbox')).toHaveClass('bg-transparent')
  })

  it('aplica el error correctamente', () => {
    render(<Input error="Este campo es requerido" />)
    expect(screen.getByText('Este campo es requerido')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('aplica clases personalizadas', () => {
    render(<Input className="custom-input" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-input')
  })

  it('maneja el estado disabled', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('maneja el estado readonly', () => {
    render(<Input readOnly />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
  })

  it('maneja diferentes tipos de input', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('maneja el ref correctamente', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('pasa props adicionales', () => {
    render(<Input data-testid="custom-input" />)
    
    expect(screen.getByTestId('custom-input')).toBeInTheDocument()
  })

  it('maneja el evento onFocus', () => {
    const handleFocus = jest.fn()
    render(<Input onFocus={handleFocus} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    
    expect(handleFocus).toHaveBeenCalled()
  })

  it('maneja el evento onBlur', () => {
    const handleBlur = jest.fn()
    render(<Input onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    
    expect(handleBlur).toHaveBeenCalled()
  })
}) 