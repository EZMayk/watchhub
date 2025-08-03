'use client'
import React from 'react'
import { Edit3, UserPlus, Settings } from 'lucide-react'
import { Card, CardContent } from './Card'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Badge } from './Badge'

interface Profile {
  id: string
  name: string
  avatar?: string
  isKid?: boolean
  isMain?: boolean
  lastWatched?: {
    title: string
    progress: number
    thumbnail: string
  }
}

interface PerfilCardProps {
  profile?: Profile
  isAddProfile?: boolean
  onSelect?: (profile: Profile) => void
  onEdit?: (profile: Profile) => void
  onAdd?: () => void
  className?: string
}

export default function PerfilCard({ 
  profile, 
  isAddProfile = false, 
  onSelect, 
  onEdit, 
  onAdd,
  className 
}: PerfilCardProps) {
  if (isAddProfile) {
    return (
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:border-red-500 bg-gray-800/50 border-2 border-dashed border-gray-600 ${className}`}
        onClick={onAdd}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <UserPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-400">Agregar Perfil</h3>
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:scale-105 group ${className}`}
      onClick={() => onSelect?.(profile)}
    >
      <CardContent className="p-6">
        {/* Header con avatar y badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              src={profile.avatar}
              fallback={profile.name.charAt(0).toUpperCase()}
              size="lg"
            />
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                {profile.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {profile.isMain && (
                  <Badge variant="default" size="sm">
                    Principal
                  </Badge>
                )}
                {profile.isKid && (
                  <Badge variant="info" size="sm">
                    Niños
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Botón de editar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(profile)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Último contenido visto */}
        {profile.lastWatched && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Continuar viendo
            </p>
            <div className="flex items-center space-x-3">
              <img
                src={profile.lastWatched.thumbnail}
                alt={profile.lastWatched.title}
                className="w-12 h-8 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile.lastWatched.title}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                  <div
                    className="bg-red-600 h-1 rounded-full"
                    style={{ width: `${profile.lastWatched.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje si no hay contenido reciente */}
        {!profile.lastWatched && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              No hay contenido reciente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}