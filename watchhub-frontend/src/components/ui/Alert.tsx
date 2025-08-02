import React from 'react'
import { cn } from '../../lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  title?: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default', 
    title, 
    description, 
    dismissible = false, 
    onDismiss, 
    icon, 
    children, 
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'success':
          return 'bg-green-900/20 border-green-700 text-green-300'
        case 'warning':
          return 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
        case 'error':
          return 'bg-red-900/20 border-red-700 text-red-300'
        case 'info':
          return 'bg-blue-900/20 border-blue-700 text-blue-300'
        default:
          return 'bg-gray-800 border-gray-600 text-gray-300'
      }
    }

    const getDefaultIcon = () => {
      switch (variant) {
        case 'success':
          return <CheckCircle className="h-4 w-4" />
        case 'warning':
          return <AlertTriangle className="h-4 w-4" />
        case 'error':
          return <AlertCircle className="h-4 w-4" />
        case 'info':
          return <Info className="h-4 w-4" />
        default:
          return <Info className="h-4 w-4" />
      }
    }

    const displayIcon = icon !== undefined ? icon : getDefaultIcon()

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <div className="flex">
          {displayIcon && (
            <div className="flex-shrink-0 mr-3">
              {displayIcon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-medium mb-1">
                {title}
              </h4>
            )}
            
            {description && (
              <p className="text-sm opacity-90">
                {description}
              </p>
            )}
            
            {children && (
              <div className="mt-2">
                {children}
              </div>
            )}
          </div>
          
          {dismissible && onDismiss && (
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={onDismiss}
                className="inline-flex rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white/20"
                aria-label="Cerrar alerta"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export { Alert }
