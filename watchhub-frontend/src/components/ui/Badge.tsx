import React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'secondary':
          return 'bg-gray-700 text-gray-200 hover:bg-gray-600'
        case 'success':
          return 'bg-green-600 text-white hover:bg-green-700'
        case 'warning':
          return 'bg-yellow-600 text-white hover:bg-yellow-700'
        case 'error':
          return 'bg-red-600 text-white hover:bg-red-700'
        case 'info':
          return 'bg-blue-600 text-white hover:bg-blue-700'
        case 'outline':
          return 'border border-gray-500 text-gray-300 hover:bg-gray-800'
        default:
          return 'bg-red-600 text-white hover:bg-red-700'
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-2 py-0.5 text-xs'
        case 'lg':
          return 'px-4 py-2 text-sm'
        default:
          return 'px-3 py-1 text-xs'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
