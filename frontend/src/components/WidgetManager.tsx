import React, { useState, useEffect } from 'react';
import { Plus, Settings, X, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { Card, Button, Badge, Modal } from './index';

interface WidgetTemplate {
  id: string;
  type: 'stats' | 'chart' | 'feed' | 'notes' | 'trends' | 'alerts';
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  defaultSize: 'small' | 'medium' | 'large';
}

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'feed' | 'notes' | 'trends' | 'alerts';
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  config?: WidgetConfig;
}

interface WidgetConfig {
  refreshInterval?: number;
  showHeader?: boolean;
  showBorder?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  customStyles?: React.CSSProperties;
}

interface WidgetManagerProps {
  availableWidgets: WidgetTemplate[];
  onWidgetAdd?: (widget: Widget) => void;
  onWidgetRemove?: (widgetId: string) => void;
}

const WidgetManager: React.FC<WidgetManagerProps> = ({
  availableWidgets,
  onWidgetAdd,
  onWidgetRemove
}) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [, setDraggedWidget] = useState<string | null>(null);

  // Load widgets from localStorage
  useEffect(() => {
    const savedWidgets = localStorage.getItem('dashboard-widgets');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }
  }, []);

  // Save widgets to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  const handleAddWidget = (widgetTemplate: WidgetTemplate) => {
    const newWidget: Widget = {
      ...widgetTemplate,
      id: `widget-${Date.now()}`,
      size: widgetTemplate.defaultSize,
      position: { x: 0, y: 0 },
      visible: true,
      config: {
        refreshInterval: 30000,
        showHeader: true,
        showBorder: true,
        theme: 'auto'
      }
    };
    
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    onWidgetAdd?.(newWidget);
    setIsModalOpen(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    onWidgetRemove?.(widgetId);
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Handle widget repositioning
  };

  const getWidgetSize = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-2';
      case 'large': return 'col-span-3 row-span-3';
      default: return 'col-span-2 row-span-2';
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Widgets
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? 'primary' : 'outline'}
            icon={<Settings />}
          >
            {isEditMode ? 'Done' : 'Edit'}
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            icon={<Plus />}
          >
            Add Widget
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`relative ${getWidgetSize(widget.size)} ${isEditMode ? 'ring-2 ring-blue-500' : ''}`}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(widget.id)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          >
            <Card padding="md" className="h-full">
              {/* Widget Header */}
              {widget.config?.showHeader && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {widget.title}
                  </h3>
                  {isEditMode && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRemoveWidget(widget.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                      >
                        <GripVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Widget Content */}
              <div className="widget-content">
                <widget.component {...widget.props} />
              </div>

              {/* Widget Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Badge variant="secondary" size="sm">
                  {widget.type}
                </Badge>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="xs">
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="xs">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Add Widget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Widget"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableWidgets.map((widget) => (
            <div
              key={widget.type}
              onClick={() => handleAddWidget(widget)}
              className="cursor-pointer"
            >
              <Card
                padding="md"
                hover
                border
                className="hover:border-blue-500 transition-colors"
              >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <widget.component {...widget.props} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {widget.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {widget.type}
                  </p>
                </div>
              </div>
            </Card>
            </div>
          ))}
        </div>
      </Modal>

      {/* Edit Mode Instructions */}
      {isEditMode && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">Drag widgets to reposition • Click X to remove</p>
        </div>
      )}
    </div>
  );
};



// Export interfaces for external use
export type { Widget, WidgetTemplate, WidgetConfig, WidgetManagerProps };
export default WidgetManager;