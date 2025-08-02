import React from 'react'
import { cn } from '../../lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  label?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 'md', 
    variant = 'default', 
    showValue = false, 
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-1'
        case 'lg':
          return 'h-3'
        default:
          return 'h-2'
      }
    }

    const getVariantClasses = () => {
      switch (variant) {
        case 'success':
          return 'bg-green-600'
        case 'warning':
          return 'bg-yellow-600'
        case 'error':
          return 'bg-red-600'
        default:
          return 'bg-red-600'
      }
    }

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {label && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-200">{label}</span>
            {showValue && (
              <span className="text-sm text-gray-400">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div className={cn('w-full bg-gray-700 rounded-full overflow-hidden', getSizeClasses())}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-in-out',
              getVariantClasses()
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {showValue && !label && (
          <div className="mt-1 text-right">
            <span className="text-xs text-gray-400">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
