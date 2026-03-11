import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, asChild, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 cursor-pointer border-none outline-none'

    const variants = {
      primary: 'bg-gradient-to-br from-accent-teal to-teal-600 text-bg-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-teal/40 disabled:opacity-50 disabled:cursor-not-allowed',
      secondary: 'bg-bg-tertiary text-text-primary border border-border-subtle hover:bg-bg-secondary hover:border-accent-teal disabled:opacity-50 disabled:cursor-not-allowed',
      ghost: 'bg-transparent text-text-primary hover:text-accent-teal disabled:opacity-50 disabled:cursor-not-allowed'
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-[0.9375rem]',
      lg: 'px-10 py-4 text-base'
    }

    if (asChild && typeof children === 'object' && children !== null) {
      const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>
      return (
        <child.type
          {...child.props}
          className={cn(baseStyles, variants[variant], sizes[size], className, child.props.className)}
          ref={ref}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {child.props.children}
        </child.type>
      )
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
