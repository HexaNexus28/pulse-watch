import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  className = '', 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = { sm: 4, md: 6, lg: 8, xl: 8 }
}) => {
  const gridClasses = [
    'grid',
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    gap.sm && `gap-${gap.sm}`,
    gap.md && `md:gap-${gap.md}`,
    gap.lg && `lg:gap-${gap.lg}`,
    gap.xl && `xl:gap-${gap.xl}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
