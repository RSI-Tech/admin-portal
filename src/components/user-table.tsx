import { Edit, Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface User {
  USER_KEY: number;
  USER_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL_ADDRESS?: string;
  STATUS?: string;
}

interface UserTableProps {
  users: User[];
  selectedUsers?: Set<number>;
  toggleUser?: (userKey: number) => void;
  toggleAll?: () => void;
  allSelected?: boolean;
}

function getStatusBadge(status?: string) {
  if (!status) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
  
  switch (status.toLowerCase()) {
    case 'active':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    case 'inactive':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    case 'suspended':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended</span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  }
}

export function UserTable({ users, selectedUsers, toggleUser, toggleAll, allSelected }: UserTableProps) {
  if (!users || users.length === 0) {
    return (
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
        <div className="text-center py-16">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#295EEF] rounded-full blur-xl opacity-20"></div>
          <div className="relative bg-gradient-to-br from-[#295EEF]/5 to-[#295EEF]/10 p-6 rounded-full">
            <UserPlus className="h-12 w-12 text-[#295EEF]" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">No users found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start building your user directory by adding the first user to the system.
        </p>
        <Button asChild className="bg-gradient-to-r from-[#295EEF] to-[#1744D6] hover:from-[#1744D6] hover:to-[#295EEF] text-white shadow-md">
          <Link href="/add-user">
            <UserPlus className="mr-2 h-4 w-4" />
            Add First User
          </Link>
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center">
                {toggleAll && (
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#295EEF] focus:ring-[#295EEF] mr-3"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                )}
                User ID
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {users.map((user, index) => (
            <tr key={user.USER_KEY} className={cn(
              "transition-colors duration-150",
              index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
            )}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {toggleUser && selectedUsers && (
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#295EEF] focus:ring-[#295EEF] mr-3"
                      checked={selectedUsers.has(user.USER_KEY)}
                      onChange={() => toggleUser(user.USER_KEY)}
                    />
                  )}
                  <div className="w-10 h-10 bg-gradient-to-br from-[#295EEF] to-[#1744D6] rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                    {user.FIRST_NAME?.[0]}{user.LAST_NAME?.[0]}
                  </div>
                  <span 
                    title={user.USER_ID}
                    className="text-sm font-sans text-gray-900 max-w-xs truncate block"
                  >
                    {user.USER_ID.length > 32 
                      ? `${user.USER_ID.substring(0, 29)}...` 
                      : user.USER_ID
                    }
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.FIRST_NAME} {user.LAST_NAME}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                  {user.EMAIL_ADDRESS || <span className="text-gray-400 italic">Not provided</span>}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(user.STATUS)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link 
                  href={`/edit-user/${user.USER_KEY}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-[#295EEF] bg-[#295EEF]/10 hover:bg-[#295EEF]/20 transition-colors duration-150"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}