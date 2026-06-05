import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'square' | 'pill';
  dot?: boolean;
  count?: number;
  showZero?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  dot = false,
  count,
  showZero = false,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-sm px-3 py-2',
  };

  const shapeClasses = {
    rounded: 'rounded-md',
    square: 'rounded-none',
    pill: 'rounded-full',
  };

  const dotClasses = 'w-2 h-2 rounded-full';

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    shapeClasses[shape],
    className
  );

  if (dot) {
    return (
      <span className={clsx(dotClasses, variantClasses[variant], className)} />
    );
  }

  if (count !== undefined) {
    const displayCount = count > 99 ? '99+' : count;
    if (count === 0 && !showZero) {
      return null;
    }
    return (
      <span className={classes}>
        {displayCount}
      </span>
    );
  }

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;
