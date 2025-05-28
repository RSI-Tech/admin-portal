'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Database, RefreshCw } from 'lucide-react';

interface Environment {
  current: string;
  name: string;
  available: string[];
}

interface EnvironmentConfig {
  name: string;
  username: string;
  database: string;
  server: string;
}

export function EnvironmentSelector() {
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const fetchEnvironment = async () => {
    setIsLoading(true);
    try {
      const envData = await apiGet('/api/environment');
      setEnvironment(envData);
    } catch (error) {
      console.error('Failed to fetch environment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchEnvironment = async (newEnv: string) => {
    if (newEnv === environment?.current) return;
    
    setIsChanging(true);
    try {
      await apiPost('/api/environment', { environment: newEnv });
      await fetchEnvironment();
      // Force a refresh of the current page data without full page reload
      window.location.href = window.location.href;
    } catch (error) {
      console.error('Error switching environment:', error);
      alert('Failed to switch environment. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };

  useEffect(() => {
    fetchEnvironment();
  }, []);

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'prod':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'test':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'int':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dev':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getEnvironmentName = (env: string) => {
    const names: Record<string, string> = {
      dev: 'Development',
      int: 'Integration',
      test: 'Testing',
      prod: 'Production'
    };
    return names[env] || env.toUpperCase();
  };

  if (isLoading || !environment) {
    return (
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={isChanging}
        >
          <Database className="h-4 w-4" />
          <Badge variant="secondary" className={getEnvironmentColor(environment.current)}>
            {environment.current.toUpperCase()}
          </Badge>
          {isChanging ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {environment.available.map((env) => (
          <DropdownMenuItem
            key={env}
            onClick={() => switchEnvironment(env)}
            className="flex items-center justify-between cursor-pointer"
            disabled={isChanging}
          >
            <span>{getEnvironmentName(env)}</span>
            <Badge 
              variant="secondary" 
              className={`${getEnvironmentColor(env)} text-xs`}
            >
              {env.toUpperCase()}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}