import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'block border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500',
    filled: 'border-transparent bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500',
    outlined: 'border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconPaddingClasses = icon ? (
    iconPosition === 'left' ? 'pl-10' : 'pr-10'
  ) : '';

  const errorClasses = error ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    iconPaddingClasses,
    errorClasses,
    widthClasses,
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="w-5 h-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}
        
        <input
          className={classes}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="w-5 h-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
