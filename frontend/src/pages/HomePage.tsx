import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../lib/api';

interface User {
  USER_KEY: number;
  USER_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  STATUS: string;
  USER_TYPE?: string;
  EMAIL_ADDRESS?: string;
}

interface FilterState {
  status: string | null;
  user_type: string | null;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    user_type: null,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (searchTerm = search, currentFilters = filters) => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (currentFilters.status) params.status = currentFilters.status;
      if (currentFilters.user_type) params.user_type = currentFilters.user_type;
      
      const data = await userApi.getUsers(params);
      setUsers(data.users);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search, filters);
  };

  const handleQuickFilter = (type: 'status' | 'user_type', value: string) => {
    const newFilters = { ...filters };
    
    // Toggle filter: if same value is clicked, remove it; otherwise set it
    if (newFilters[type] === value) {
      newFilters[type] = null;
    } else {
      newFilters[type] = value;
    }
    
    setFilters(newFilters);
    loadUsers(search, newFilters);
  };

  const clearAllFilters = () => {
    setSearch('');
    setFilters({ status: null, user_type: null });
    loadUsers('', { status: null, user_type: null });
  };

  const hasActiveFilters = search || filters.status || filters.user_type;

  const handleStatusToggle = async (userKey: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await userApi.updateUserStatus(userKey, newStatus);
      // Update local state
      setUsers(users.map(u => 
        u.USER_KEY === userKey ? { ...u, STATUS: newStatus } : u
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users in the system including their name, status, and type.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/add-user"
            className="btn-primary inline-flex items-center"
          >
            Add User
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-secondary"
            >
              Clear All
            </button>
          )}
        </form>
        
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Quick filters:</span>
          
          {/* Status Filters */}
          <button
            type="button"
            onClick={() => handleQuickFilter('status', 'Active')}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              filters.status === 'Active'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Active Users
          </button>
          
          <button
            type="button"
            onClick={() => handleQuickFilter('status', 'Inactive')}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              filters.status === 'Inactive'
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inactive Users
          </button>
          
          {/* User Type Filters */}
          <button
            type="button"
            onClick={() => handleQuickFilter('user_type', 'SYSTEM')}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              filters.user_type === 'SYSTEM'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            SYSTEM Users
          </button>
          
          <button
            type="button"
            onClick={() => handleQuickFilter('user_type', 'INTRANET')}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              filters.user_type === 'INTRANET'
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            INTRANET Users
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      User Key
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      User ID
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.USER_KEY}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {user.USER_KEY}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {user.USER_ID}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {user.FIRST_NAME} {user.LAST_NAME}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.USER_TYPE || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.EMAIL_ADDRESS || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => handleStatusToggle(user.USER_KEY, user.STATUS)}
                          className={`toggle-switch ${
                            user.STATUS === 'Active' 
                              ? 'toggle-switch-active' 
                              : 'toggle-switch-inactive'
                          }`}
                        >
                          <span 
                            className={`toggle-switch-thumb ${
                              user.STATUS === 'Active'
                                ? 'toggle-switch-thumb-active'
                                : 'toggle-switch-thumb-inactive'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 ${
                          user.STATUS === 'Active' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {user.STATUS}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/edit-user/${user.USER_KEY}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/duplicate-user/${user.USER_KEY}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Duplicate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}