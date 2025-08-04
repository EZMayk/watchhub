'use client'
import React from 'react'
import Link from 'next/link'
import { Film, LogIn, UserPlus } from 'lucide-react'
import { Button } from './ui'

export default function LandingNavbar() {
  return (
    <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover-lift">
              <Film className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-white text-gradient">WatchHub</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button 
                variant="ghost" 
                size="sm"
                icon={<LogIn className="h-4 w-4" />}
                className="hover-lift"
              >
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Entrar</span>
              </Button>
            </Link>
            
            <Link href="/auth/register">
              <Button 
                variant="gradient" 
                size="sm"
                icon={<UserPlus className="h-4 w-4" />}
                className="hover-lift"
              >
                <span className="hidden sm:inline">Registrarse</span>
                <span className="sm:hidden">Registro</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
