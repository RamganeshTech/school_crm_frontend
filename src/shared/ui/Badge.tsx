import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  icon?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  icon,
  className = '' 
}) => {
  const variants = {
    primary: "bg-primary-soft text-primary border-primary/20",
    success: "bg-green-50 text-green-700 border-green-200", // Semantic colors
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-background text-content-muted border-divider",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <i className={`${icon} mr-1.5 text-[10px]`}></i>}
      {children}
    </span>
  );
};