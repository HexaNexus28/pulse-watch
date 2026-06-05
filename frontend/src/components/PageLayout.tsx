import React, { useState } from 'react';
import { Header, Footer, MobileNavigation } from './index';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showFooter?: boolean;
  showMobileNav?: boolean;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  showFooter = true,
  showMobileNav = true,
  className = '',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Header 
        onMenuToggle={handleMenuToggle}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Page Header */}
        {(title || description) && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {title && (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className={className}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}

      {/* Mobile Navigation */}
      {showMobileNav && (
        <MobileNavigation 
          currentPage={title?.toLowerCase()}
        />
      )}
    </div>
  );
};

export default PageLayout;
