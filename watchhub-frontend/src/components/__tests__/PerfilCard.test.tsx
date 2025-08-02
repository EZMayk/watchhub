import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PerfilCard from '../PerfilCard'

describe('PerfilCard', () => {
  const mockProfile = {
    id: '1',
    name: 'Test Profile',
    avatar: 'https://example.com/avatar.jpg',
    isKid: false,
    isMain: true
  }

  const onSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza correctamente', () => {
    render(<PerfilCard profile={mockProfile} onSelect={onSelect} />)
    
    const card = screen.getByText('Test Profile').closest('.cursor-pointer')
    fireEvent.click(card!)
    
    expect(onSelect).toHaveBeenCalledWith(mockProfile)
  })

  it('renderiza sin función onSelect', () => {
    render(<PerfilCard profile={mockProfile} />)
    
    const card = screen.getByText('Test Profile').closest('.cursor-pointer')
    expect(card).toBeInTheDocument()
    
    // No debería fallar al hacer clic
    fireEvent.click(card!)
  })

  it('maneja perfiles sin avatar', () => {
    const profileSinAvatar = { ...mockProfile, avatar: undefined }
    render(<PerfilCard profile={profileSinAvatar} />)
    
    expect(screen.getByText('Test Profile')).toBeInTheDocument()
    // Debería mostrar un avatar por defecto con la primera letra del nombre
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('maneja perfiles sin color', () => {
    const profileSinColor = { ...mockProfile, color: undefined }
    render(<PerfilCard profile={profileSinColor} />)
    
    expect(screen.getByText('Test Profile')).toBeInTheDocument()
  })

  it('aplica las clases CSS correctas', () => {
    render(<PerfilCard profile={mockProfile} />)
    
    const card = screen.getByText('Test Profile').closest('.rounded-lg')
    expect(card).toHaveClass('rounded-lg', 'cursor-pointer', 'transition-all')
  })

  it('renderiza el modo agregar perfil', () => {
    const onAdd = jest.fn()
    render(<PerfilCard isAddProfile={true} onAdd={onAdd} />)
    
    expect(screen.getByText('Agregar Perfil')).toBeInTheDocument()
    
    const card = screen.getByText('Agregar Perfil').closest('.cursor-pointer')
    fireEvent.click(card!)
    
    expect(onAdd).toHaveBeenCalled()
  })

  it('muestra badges para perfiles principales y niños', () => {
    const profileConBadges = { ...mockProfile, isMain: true, isKid: true }
    render(<PerfilCard profile={profileConBadges} />)
    
    expect(screen.getByText('Principal')).toBeInTheDocument()
    expect(screen.getByText('Niños')).toBeInTheDocument()
  })

  it('maneja perfiles sin lastWatched', () => {
    render(<PerfilCard profile={mockProfile} />)
    
    expect(screen.getByText('No hay contenido reciente')).toBeInTheDocument()
  })

  it('muestra contenido reciente cuando está disponible', () => {
    const profileConContenido = {
      ...mockProfile,
      lastWatched: {
        title: 'Test Movie',
        progress: 50,
        thumbnail: 'https://example.com/thumbnail.jpg'
      }
    }
    render(<PerfilCard profile={profileConContenido} />)
    
    expect(screen.getByText('Continuar viendo')).toBeInTheDocument()
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('maneja el botón de editar', () => {
    const onEdit = jest.fn()
    render(<PerfilCard profile={mockProfile} onEdit={onEdit} />)
    
    // El botón de editar solo aparece en hover, pero podemos simular el evento
    const card = screen.getByText('Test Profile').closest('.cursor-pointer')
    fireEvent.mouseEnter(card!)
    
    // Buscar el botón de editar por su icono
    const editButton = screen.getByRole('button')
    fireEvent.click(editButton)
    
    expect(onEdit).toHaveBeenCalledWith(mockProfile)
  })

  it('no renderiza nada cuando no hay profile y no es modo agregar', () => {
    const { container } = render(<PerfilCard />)
    expect(container.firstChild).toBeNull()
  })
}) 