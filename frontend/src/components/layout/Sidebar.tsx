import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: '📊'
  },
  {
    id: 'user-management',
    title: 'User Management',
    path: '/users',
    icon: '👥',
    children: [
      {
        id: 'users',
        title: 'Users',
        path: '/',
        icon: '👤'
      },
      {
        id: 'add-user',
        title: 'Add User',
        path: '/add-user',
        icon: '➕'
      }
    ]
  },
  {
    id: 'system-health',
    title: 'System Health',
    path: '/health',
    icon: '🏥',
    children: [
      {
        id: 'application-health',
        title: 'Application Health',
        path: '/health/application',
        icon: '💓'
      },
      {
        id: 'queue-monitoring',
        title: 'Queue Monitoring',
        path: '/health/queues',
        icon: '📋'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    path: '/operations',
    icon: '⚙️',
    children: [
      {
        id: 'background-jobs',
        title: 'Background Jobs',
        path: '/operations/jobs',
        icon: '🔄'
      },
      {
        id: 'system-logs',
        title: 'System Logs',
        path: '/operations/logs',
        icon: '📄'
      }
    ]
  },
  {
    id: 'configuration',
    title: 'Configuration',
    path: '/configuration',
    icon: '🔧',
    children: [
      {
        id: 'environment-settings',
        title: 'Environment Settings',
        path: '/configuration/environment',
        icon: '🌍'
      },
      {
        id: 'system-config',
        title: 'System Configuration',
        path: '/configuration/system',
        icon: '⚙️'
      }
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['user-management']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActiveItem = (path: string) => {
    return location.pathname === path;
  };

  const isActiveParent = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some(child => isActiveItem(child.path));
    }
    return isActiveItem(item.path);
  };

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900"
          >
            {!isCollapsed && (
              <span className="text-sm font-medium">Navigation</span>
            )}
            <span className="text-lg">
              {isCollapsed ? '→' : '←'}
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => (
            <div key={item.id}>
              {/* Parent Item */}
              <div className="group">
                {item.children ? (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveParent(item)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <span className={`transition-transform ${
                          expandedItems.includes(item.id) ? 'rotate-90' : ''
                        }`}>
                          ▶
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveItem(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </div>

              {/* Child Items */}
              {item.children && expandedItems.includes(item.id) && !isCollapsed && (
                <div className="mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      to={child.path}
                      className={`flex items-center pl-11 pr-3 py-2 text-sm rounded-md transition-colors ${
                        isActiveItem(child.path)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base mr-2">{child.icon}</span>
                      <span>{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="text-xs text-gray-500">
              Government Premier Admin Portal
            </div>
          )}
        </div>
      </div>
    </div>
  );
}