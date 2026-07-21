import * as React from 'react'
import { LoaderCircle } from 'lucide-react'
import cn from '@/utils/cn-helper'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'pastel'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer duration-200",
          // Variants
          variant === 'default' && "bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)] hover:-translate-y-0.5 hover:shadow-lg",
          variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-violet-200",
          variant === 'outline' && "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
          variant === 'ghost' && "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          variant === 'link' && "text-primary underline-offset-4 hover:underline",
          variant === 'destructive' && "bg-destructive text-destructive-foreground shadow-sm hover:bg-red-600",
          variant === 'pastel' && "bg-accent text-accent-foreground hover:bg-emerald-200",
          // Sizes
          size === 'default' && "h-11 px-5 py-2",
          size === 'sm' && "h-9 rounded-lg px-3 text-xs",
          size === 'lg' && "h-14 rounded-2xl px-8 text-base",
          size === 'icon' && "h-11 w-11 rounded-xl",
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >{isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}{children}</button>
    )
  }
)

Button.displayName = 'Button'

export default Button
