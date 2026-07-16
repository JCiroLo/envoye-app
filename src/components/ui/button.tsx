import * as React from 'react'
import cn from '@/utils/cn-helper'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'pastel'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer duration-200",
          // Variants
          variant === 'default' && "bg-primary text-primary-foreground shadow-sm hover:brightness-95",
          variant === 'secondary' && "bg-secondary text-secondary-foreground shadow-sm hover:brightness-95",
          variant === 'outline' && "border border-input bg-background hover:bg-muted hover:text-muted-foreground",
          variant === 'ghost' && "hover:bg-muted hover:text-muted-foreground",
          variant === 'link' && "text-primary underline-offset-4 hover:underline",
          variant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
          variant === 'pastel' && "bg-accent text-accent-foreground shadow-sm hover:brightness-95",
          // Sizes
          size === 'default' && "h-11 px-5 py-2",
          size === 'sm' && "h-9 rounded-lg px-3 text-xs",
          size === 'lg' && "h-14 rounded-2xl px-8 text-base",
          size === 'icon' && "h-11 w-11 rounded-xl",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button
