import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldConfig } from '../lib/field-config';
import { userApi } from '../lib/api';

interface FieldConfig {
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select';
  maxLength?: number;
  label: string;
  options?: (string | { value: string; label: string })[];
}

interface User {
  USER_KEY?: number;
  USER_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  STATUS: string;
  UPDATED_BY: string;
  [key: string]: any;
}

interface UserFormProps {
  mode: 'create' | 'edit';
  userKey?: number;
}

export default function UserForm({ mode, userKey }: UserFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<User>>({
    USER_ID: '',
    FIRST_NAME: '',
    LAST_NAME: '',
    STATUS: 'Active',
    UPDATED_BY: 'SYSTEM',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user data for edit mode
  useEffect(() => {
    if (mode === 'edit' && userKey) {
      loadUser();
    }
  }, [mode, userKey]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await userApi.getUser(userKey!);
      setFormData(userData);
    } catch (err: any) {
      setError('Failed to load user data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Filter out system-generated fields for updates
      const systemFields = [
        'USER_KEY', 'UPDATED_DATE', 'EFFECTIVE_BEGIN_DT', 'EFFECTIVE_END_DT',
        'PASSWORD_CHANGED_DATE', 'LOGGED_IN_FLAG', 'OVERRIDE_PROHIBIT_FLAG',
        'IGNORE_LOGIN_DATE', 'LAST_LOGIN_CLIENT', 'LAST_LOGIN_IP_ADDRESS',
        'LAST_LOGIN_DATE', 'LAST_LOCAL_SYNC_DATE', 'LAST_CENTRAL_SYNC_DATE',
        'LEGACY_ID', 'CUSTOM_SID', 'DEFAULT_PRINTER_CODE'
      ];

      // Also filter out user attribute fields that are system-managed
      for (let i = 1; i <= 10; i++) {
        systemFields.push(
          `USER_ATTR_TYPE_${i}`, `USER_ATTR_VALUE_${i}`,
          `USER_ATTR_EFF_BEGIN_DT_${i}`, `USER_ATTR_EFF_END_DT_${i}`
        );
      }

      const cleanedData = { ...formData };
      systemFields.forEach(field => delete cleanedData[field]);

      if (mode === 'create') {
        await userApi.createUser(cleanedData);
        setSuccess('User created successfully!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        await userApi.updateUser(userKey!, cleanedData);
        setSuccess('User updated successfully!');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err: any) {
      setError('Failed to save user: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FieldConfig, isMandatory: boolean = false) => {
    const value = formData[field.name] || '';

    const fieldClasses = "block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6";

    if (field.type === 'select') {
      return (
        <select
          name={field.name}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className={fieldClasses}
          required={isMandatory}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((option) => {
            if (typeof option === 'string') {
              return <option key={option} value={option}>{option}</option>;
            } else {
              return <option key={option.value} value={option.value}>{option.label}</option>;
            }
          })}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        name={field.name}
        value={value}
        onChange={(e) => handleInputChange(field.name, field.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
        maxLength={field.maxLength}
        className={fieldClasses}
        required={isMandatory}
        placeholder={`Enter ${field.label}`}
      />
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </h1>
          {mode === 'edit' && formData.USER_ID && (
            <p className="mt-1 text-sm text-gray-500">
              User ID: {formData.USER_ID}
            </p>
          )}
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-800">{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mandatory Fields */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <h3 className="text-base font-semibold leading-7 text-gray-900">Required Information</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  These fields are required and must be filled out.
                </p>
              </div>

              {fieldConfig.mandatory.map((field) => (
                <div key={field.name} className="sm:col-span-2">
                  <label htmlFor={field.name} className="block text-sm font-medium leading-6 text-gray-900">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    {renderField(field, true)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <h3 className="text-base font-semibold leading-7 text-gray-900">Additional Information</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  These fields are optional but can provide additional context.
                </p>
              </div>

              {fieldConfig.optional.map((field) => (
                <div key={field.name} className="sm:col-span-2">
                  <label htmlFor={field.name} className="block text-sm font-medium leading-6 text-gray-900">
                    {field.label}
                  </label>
                  <div className="mt-2">
                    {renderField(field, false)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-x-6 pt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Update User')}
          </button>
        </div>
      </form>
    </div>
  );
}