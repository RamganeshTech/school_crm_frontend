import { type ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children, variant = 'primary', size = 'md',
  isLoading = false, leftIcon, rightIcon,
  fullWidth = false, className = '', disabled, ...props
}, ref) => {
  const baseStyles = "inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soft disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:   "bg-primary text-inverse hover:bg-primary-hover shadow-sm",
    secondary: "bg-primary-soft text-primary hover:bg-primary hover:text-inverse",
    outline:   "border-2 border-primary text-primary hover:bg-primary-soft",
    ghost:     "bg-transparent text-muted hover:text-foreground hover:bg-surface",
    danger:    "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200",
  };

  const sizes = {
    sm:   "px-3 py-1.5 text-xs",
    md:   "px-4 py-2 text-sm",
    lg:   "px-6 py-3 text-base",
    icon: "p-2 aspect-square flex items-center justify-center text-sm",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
      ) : leftIcon ? (
        <i className={`${leftIcon} ${children ? 'mr-2' : ''}`}></i>
      ) : null}
      {children}
      {!isLoading && rightIcon && <i className={`${rightIcon} ml-2`}></i>}
    </button>
  );
});
Button.displayName = 'Button';