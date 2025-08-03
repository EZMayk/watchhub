import React from 'react'
import { cn } from '../../lib/utils'

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse'
  text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'default', text, ...props }, ref) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-4 w-4'
        case 'lg':
          return 'h-8 w-8'
        case 'xl':
          return 'h-12 w-12'
        default:
          return 'h-6 w-6'
      }
    }

    const renderSpinner = () => {
      switch (variant) {
        case 'dots':
          return (
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )
        case 'pulse':
          return (
            <div className={cn('bg-red-500 rounded-full animate-pulse', getSizeClasses())}></div>
          )
        default:
          return (
            <svg
              className={cn('animate-spin text-red-500', getSizeClasses())}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )
      }
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center', className)}
        data-testid="loading-spinner"
        {...props}
      >
        {renderSpinner()}
        {text && (
          <p className="mt-2 text-sm text-gray-400">{text}</p>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner }
