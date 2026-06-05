import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  border?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  hover = true,
  border = false
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const roundedClasses = {
    none: '',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl'
  };

  const hoverClasses = hover ? 'hover:shadow-lg dark:hover:shadow-xl hover:-translate-y-1 transition-all duration-200' : '';
  const borderClasses = border ? 'border border-gray-200 dark:border-gray-700' : '';

  const classes = clsx(
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    roundedClasses[rounded],
    hoverClasses,
    borderClasses,
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;
