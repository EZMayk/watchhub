import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navbar from '../Navbar'

describe('Navbar', () => {
  it('renderiza correctamente', () => {
    render(<Navbar />)
    
    expect(screen.getByText('WatchHub')).toBeInTheDocument()
  })

  it('muestra el logo', () => {
    render(<Navbar />)
    
    const logo = screen.getByText('WatchHub')
    expect(logo).toBeInTheDocument()
  })

  it('renderiza los enlaces de navegación', () => {
    render(<Navbar />)
    
    // Verificar que los enlaces principales están presentes
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Películas')).toBeInTheDocument()
    expect(screen.getByText('Series')).toBeInTheDocument()
    expect(screen.getByText('Mi Lista')).toBeInTheDocument()
  })

  it('muestra el menú de usuario cuando hay un usuario autenticado', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg'
    }
    const mockOnLogout = jest.fn()
    
    render(<Navbar user={mockUser} onLogout={mockOnLogout} />)
    
    // Verificar que el avatar está presente
    const avatar = screen.getByAltText('Avatar')
    expect(avatar).toBeInTheDocument()
    
    // Hacer clic en el avatar para abrir el menú
    const avatarButton = screen.getAllByRole('button')[1] // El segundo botón es el avatar
    fireEvent.click(avatarButton)
    
    // Verificar que se muestra el email del usuario
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('maneja el logout', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg'
    }
    const mockOnLogout = jest.fn()
    
    render(<Navbar user={mockUser} onLogout={mockOnLogout} />)
    
    // Hacer clic en el avatar para abrir el menú
    const avatarButton = screen.getAllByRole('button')[1] // El segundo botón es el avatar
    fireEvent.click(avatarButton)
    
    // Buscar el botón de cerrar sesión
    const logoutButton = screen.getByText('Cerrar Sesión')
    fireEvent.click(logoutButton)
    
    expect(mockOnLogout).toHaveBeenCalled()
  })

  it('muestra los botones de login/register cuando no hay usuario', () => {
    render(<Navbar />)
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Registrarse')).toBeInTheDocument()
  })

  it('maneja el menú móvil', () => {
    render(<Navbar />)
    
    // Hacer clic en el botón del menú móvil (el último botón)
    const menuButton = screen.getAllByRole('button')[2] // El tercer botón es el menú móvil
    fireEvent.click(menuButton)
    
    // Verificar que el menú móvil se abre buscando el campo de búsqueda móvil
    const mobileSearchInput = screen.getAllByPlaceholderText('Buscar...')[1] // El segundo input es el móvil
    expect(mobileSearchInput).toBeInTheDocument()
  })

  it('muestra el campo de búsqueda', () => {
    render(<Navbar />)
    
    const searchInput = screen.getByPlaceholderText('Buscar...')
    expect(searchInput).toBeInTheDocument()
  })

  it('maneja la búsqueda', () => {
    render(<Navbar />)
    
    const searchInput = screen.getByPlaceholderText('Buscar...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    expect(searchInput).toHaveValue('test search')
  })
}) 