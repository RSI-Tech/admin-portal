import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { environmentApi } from '../lib/api';

export default function Navigation() {
  const [environment, setEnvironment] = useState('dev');

  useEffect(() => {
    loadEnvironment();
  }, []);

  const loadEnvironment = async () => {
    try {
      const data = await environmentApi.getEnvironment();
      setEnvironment(data.environment);
    } catch (error) {
      console.error('Failed to load environment:', error);
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
      default: return 'env-badge-dev';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              Admin Portal
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="environment" className="text-sm font-medium text-gray-700">
                Environment:
              </label>
              <select
                id="environment"
                value={environment}
                onChange={(e) => handleEnvironmentChange(e.target.value)}
                className="text-sm"
              >
                <option value="dev">Development</option>
                <option value="int">Integration</option>
                <option value="test">Test</option>
                <option value="prod">Production</option>
              </select>
              <span className={getEnvironmentBadgeClass(environment)}>
                {environment.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}