import React, { useState } from 'react';
import { Menu, Home, BarChart3, FileText, TrendingUp, User, Bell, Search, Settings } from 'lucide-react';

interface MobileNavigationProps {
  currentPage?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-600' },
    { name: 'Categories', href: '/categories', icon: BarChart3, color: 'text-green-600' },
    { name: 'Notes', href: '/notes', icon: FileText, color: 'text-purple-600' },
    { name: 'Trends', href: '/trends', icon: TrendingUp, color: 'text-orange-600' },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.slice(0, 4).map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                currentPage === item.name.toLowerCase()
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          ))}
          
          {/* More button */}
          <button
            onClick={toggleMenu}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>

      {/* Slide-up Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={closeMenu}
          />
          
          {/* Menu Content */}
          <div className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.name.toLowerCase()
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
              
              {/* Additional Menu Items */}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <a
                  href="/settings"
                  onClick={closeMenu}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">Settings</span>
                </a>
                <a
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <User className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">Profile</span>
                </a>
                <button
                  onClick={closeMenu}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors w-full"
                >
                  <Bell className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">Notifications</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNavigation;
