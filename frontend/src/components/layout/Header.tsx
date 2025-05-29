import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { environmentApi } from '../../lib/api';

interface Environment {
  key: string;
  name: string;
  server: string;
  database: string;
}

export default function Header() {
  const [environment, setEnvironment] = useState('dev');
  const [availableEnvironments, setAvailableEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load both current environment and available environments
      const [currentEnv, environments] = await Promise.all([
        environmentApi.getEnvironment(),
        environmentApi.getEnvironments()
      ]);
      
      setEnvironment(currentEnv.environment);
      setAvailableEnvironments(environments.environments);
    } catch (error) {
      console.error('Failed to load environment data:', error);
      // Fallback to hardcoded environments if API fails
      setAvailableEnvironments([
        { key: 'dev', name: 'Development', server: '', database: '' },
        { key: 'int', name: 'Integration', server: '', database: '' },
        { key: 'test', name: 'Test', server: '', database: '' },
        { key: 'prod', name: 'Production', server: '', database: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnvironmentChange = async (newEnv: string) => {
    try {
      await environmentApi.setEnvironment(newEnv);
      setEnvironment(newEnv);
      // Reload the page to refresh data with new environment
      window.location.reload();
    } catch (error) {
      console.error('Failed to change environment:', error);
    }
  };

  const getEnvironmentBadgeClass = (env: string) => {
    switch (env) {
      case 'dev': return 'env-badge-dev';
      case 'int': return 'env-badge-int';
      case 'test': return 'env-badge-test';
      case 'prod': return 'env-badge-prod';
      case 'sbx': return 'env-badge-dev'; // Sandbox uses dev styling
      default: return 'env-badge-dev';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Government Premier
              </span>
            </Link>
          </div>

          {/* Center - Page Context (could be used for breadcrumbs) */}
          <div className="hidden md:flex items-center">
            <span className="text-sm text-gray-500">Admin Portal</span>
          </div>
          
          {/* Right Side - Environment Selector and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Environment Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="environment" className="text-sm font-medium text-gray-700">
                Environment:
              </label>
              <select
                id="environment"
                value={environment}
                onChange={(e) => handleEnvironmentChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {loading ? (
                  <option>Loading...</option>
                ) : (
                  availableEnvironments.map((env) => (
                    <option key={env.key} value={env.key}>
                      {env.name}
                    </option>
                  ))
                )}
              </select>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEnvironmentBadgeClass(environment)}`}>
                {environment.toUpperCase()}
              </span>
            </div>

            {/* User Profile Menu (placeholder for future) */}
            <div className="flex items-center">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">👤</span>
                </div>
                <span className="hidden sm:block">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}