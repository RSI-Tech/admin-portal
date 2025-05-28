'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle } from 'lucide-react';

interface UserMigrationProps {
  userKey: number;
  userId: string;
  currentEnvironment: string;
  availableEnvironments: string[];
  onMigrationSuccess?: () => void;
}

interface EnvironmentNames {
  [key: string]: string;
}

const environmentNames: EnvironmentNames = {
  dev: 'Development',
  int: 'Integration', 
  test: 'Test',
  prod: 'Production'
};

const environmentColors: EnvironmentNames = {
  dev: 'bg-green-100 text-green-800',
  int: 'bg-blue-100 text-blue-800',
  test: 'bg-yellow-100 text-yellow-800',
  prod: 'bg-red-100 text-red-800'
};

export function UserMigration({ 
  userKey, 
  userId, 
  currentEnvironment, 
  availableEnvironments,
  onMigrationSuccess 
}: UserMigrationProps) {
  const [targetEnvironment, setTargetEnvironment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const targetEnvironments = availableEnvironments.filter(env => env !== currentEnvironment);

  const handleMigrate = async () => {
    if (!targetEnvironment) {
      setError('Please select a target environment');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/users/${userKey}/migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetEnvironment
        }),
      });

      const result = await response.json();
      console.log('Migration API Response:', response.status, result);

      if (!response.ok) {
        throw new Error(result.error || 'Migration failed');
      }

      const successMessage = `✅ Migration Complete! User successfully migrated to ${environmentNames[targetEnvironment] || targetEnvironment} environment. New USER_KEY: ${result.newUserKey}. Migrated ${result.migratedProfiles} profile(s).`;
      console.log('Setting success message:', successMessage);
      
      setSuccess(successMessage);
      setTargetEnvironment('');
      console.log('Success state set, current success value:', successMessage);
      
      // Auto-clear success message after 10 seconds
      setTimeout(() => {
        setSuccess('');
      }, 10000);
      
      if (onMigrationSuccess) {
        onMigrationSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Migrate User</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${environmentColors[currentEnvironment] || 'bg-gray-100 text-gray-800'}`}>
            Currently in {environmentNames[currentEnvironment] || currentEnvironment}
          </span>
        </CardTitle>
        <CardDescription>
          Migrate user {userId} (USER_KEY: {userKey}) to another environment. 
          All user data and profiles will be copied to the target environment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-500 bg-green-50 border-2 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <AlertDescription className="text-green-800 font-medium leading-relaxed">{success}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Debug: success = &quot;{success}&quot; | error = &quot;{error}&quot; | isLoading = {isLoading.toString()}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="target-env" className="text-sm font-medium">
            Target Environment
          </label>
          <select
            id="target-env"
            value={targetEnvironment}
            onChange={(e) => setTargetEnvironment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Select target environment...</option>
            {targetEnvironments.map(env => (
              <option key={env} value={env}>
                {environmentNames[env] || env}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-medium text-yellow-800 mb-2">Migration Details:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• All user data will be copied except USER_KEY (new key will be generated)</li>
            <li>• All associated profiles from USER_TO_PROFILE table will be migrated</li>
            <li>• Migration will fail if USER_ID already exists in target environment</li>
            <li>• Original user data remains unchanged in current environment</li>
          </ul>
        </div>

        <Button 
          onClick={handleMigrate}
          disabled={isLoading || !targetEnvironment}
          className="w-full"
        >
          {isLoading ? 'Migrating...' : 'Migrate User'}
        </Button>
      </CardContent>
    </Card>
  );
}