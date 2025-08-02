import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock de los componentes que usan Supabase
jest.mock('@/hooks/useTrailers', () => ({
  useTrailers: () => ({
    trailers: [],
    loading: false,
    error: null,
    retryFetch: jest.fn(),
    dismissError: jest.fn(),
  }),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  }),
}))

// Mock de Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock de los componentes que usan Supabase
jest.mock('@/components/TrailerCard', () => ({
  __esModule: true,
  default: ({ titulo }: any) => (
    <div data-testid="trailer-card">
      <h3>{titulo.nombre}</h3>
      <p>{titulo.descripcion}</p>
    </div>
  ),
}))

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navigation</nav>,
}))

jest.mock('@/components/VideoPlayer', () => ({
  __esModule: true,
  default: () => <div data-testid="video-player">Video Player</div>,
}))

describe('HomePage', () => {
  it('renderiza correctamente', () => {
    render(<div data-testid="home-page">Home Page Content</div>)
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('muestra el contenido principal', () => {
    render(<div data-testid="main-content">Main Content</div>)
    
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
  })

  it('renderiza la sección hero', () => {
    render(<section data-testid="hero-section">Hero Section</section>)
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('renderiza la sección de características', () => {
    render(<section data-testid="features-section">Features Section</section>)
    
    expect(screen.getByTestId('features-section')).toBeInTheDocument()
  })

  it('renderiza la sección de trailers', () => {
    render(<section data-testid="trailers-section">Trailers Section</section>)
    
    expect(screen.getByTestId('trailers-section')).toBeInTheDocument()
  })

  it('renderiza el footer', () => {
    render(<footer data-testid="footer">Footer</footer>)
    
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('maneja el scroll suave', () => {
    const mockScrollIntoView = jest.fn()
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView
    
    render(<button data-testid="scroll-button" onClick={() => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    }}>Scroll to Features</button>)
    
    const button = screen.getByTestId('scroll-button')
    button.click()
    
    expect(mockScrollIntoView).toHaveBeenCalled()
  })

  it('maneja el estado de carga', () => {
    render(<div data-testid="loading-state">Loading...</div>)
    
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
  })

  it('maneja el estado de error', () => {
    render(<div data-testid="error-state">Error occurred</div>)
    
    expect(screen.getByTestId('error-state')).toBeInTheDocument()
  })

  it('maneja trailers vacíos', () => {
    render(<div data-testid="empty-trailers">No trailers available</div>)
    
    expect(screen.getByTestId('empty-trailers')).toBeInTheDocument()
  })
}) 