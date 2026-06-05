import React from 'react';
import  WidgetManager from '../components/WidgetManager';
import {availableWidgets} from '../widgets/widgets';
import PWAInstaller  from '../components/PWAInstaller';

const WidgetDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Widget Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl">
            Customize your dashboard with widgets and install the PWA for the best experience
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* PWA Installer */}
        <PWAInstaller />

        {/* Widget Manager */}
        <WidgetManager 
          availableWidgets={availableWidgets}
          onWidgetAdd={(_widget) => {
            // Widget added successfully
          }}
          onWidgetRemove={(_widgetId) => {
            // Widget removed successfully
          }}
        />
      </div>
    </div>
  );
};

export default WidgetDashboard;
