import React from 'react'
import { cn } from '../../lib/utils'
import { User } from 'lucide-react'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  variant?: 'circle' | 'square'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, variant = 'circle', ...props }, ref) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-8 w-8 text-xs'
        case 'lg':
          return 'h-12 w-12 text-lg'
        case 'xl':
          return 'h-16 w-16 text-xl'
        default:
          return 'h-10 w-10 text-sm'
      }
    }

    const getVariantClasses = () => {
      switch (variant) {
        case 'square':
          return 'rounded-lg'
        default:
          return 'rounded-full'
      }
    }

    const [imageError, setImageError] = React.useState(false)

    const handleImageError = () => {
      setImageError(true)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden bg-gray-700 border border-gray-600',
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            className="h-full w-full object-cover"
            src={src}
            alt={alt || 'Avatar'}
            onError={handleImageError}
          />
        ) : fallback ? (
          <span className="font-medium text-gray-200 select-none">
            {fallback}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-gray-400" />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

const AvatarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { max?: number }>(
  ({ className, children, max, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray
    const hiddenCount = max ? Math.max(0, childrenArray.length - max) : 0

    return (
      <div
        ref={ref}
        className={cn('flex -space-x-2', className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="ring-2 ring-gray-900">
            {child}
          </div>
        ))}
        {hiddenCount > 0 && (
          <div className="h-10 w-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs font-medium text-gray-200">
            +{hiddenCount}
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup }
