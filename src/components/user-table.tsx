import { Edit, Mail, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  onUserStatusChange?: (userKey: number, newStatus: string) => void;
}

function StatusToggle({ user, onStatusChange }: { user: User; onStatusChange: (userKey: number, newStatus: string) => Promise<void> }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isActive = user.STATUS?.toLowerCase() === 'active';

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const newStatus = isActive ? 'Inactive' : 'Active';
      await onStatusChange(user.USER_KEY, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
        ${isActive ? 'bg-green-500' : 'bg-gray-300'}
        ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${isActive ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
      <span className="sr-only">
        {isActive ? 'Deactivate user' : 'Activate user'}
      </span>
    </button>
  );
}

function getStatusBadge(status?: string) {
  if (!status) return <Badge variant="muted">Unknown</Badge>;
  
  switch (status.toLowerCase()) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'inactive':
      return <Badge variant="muted">Inactive</Badge>;
    case 'suspended':
      return <Badge variant="destructive">Suspended</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="muted">{status}</Badge>;
  }
}

export function UserTable({ users, selectedUsers, toggleUser, toggleAll, allSelected, onUserStatusChange }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [localUsers, setLocalUsers] = useState(users);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleStatusChange = async (userKey: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${userKey}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setLocalUsers(prev => 
        prev.map(user => 
          user.USER_KEY === userKey 
            ? { ...user, STATUS: newStatus }
            : user
        )
      );

      // Call parent callback if provided
      if (onUserStatusChange) {
        onUserStatusChange(userKey, newStatus);
      }

    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleRowClick = (user: User, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('input[type="checkbox"], a, button')) {
      return;
    }
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  if (!localUsers || localUsers.length === 0) {
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
    <TooltipProvider>
      <div className="relative overflow-auto shadow-sm rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-white/90 backdrop-blur-md">
            <tr className="grid grid-cols-[8ch_32ch_1fr_2fr_8ch_6ch] gap-4 px-6 py-4">
              <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  {toggleAll && (
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#295EEF] focus:ring-[#295EEF] mr-3"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  )}
                  Key
                </div>
              </th>
              <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                User ID
              </th>
              <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
          {localUsers.map((user, index) => (
            <tr 
              key={user.USER_KEY} 
              className={cn(
                "grid grid-cols-[8ch_32ch_1fr_2fr_8ch_6ch] gap-4 px-6 py-4 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                index % 2 === 1 ? 'odd:bg-gray-50' : ''
              )}
              onClick={(e) => handleRowClick(user, e)}
            >
              <td className="flex items-center">
                {toggleUser && selectedUsers && (
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#295EEF] focus:ring-[#295EEF] mr-3"
                    checked={selectedUsers.has(user.USER_KEY)}
                    onChange={() => toggleUser(user.USER_KEY)}
                  />
                )}
                <span className="text-sm font-sans text-gray-900">
                  {user.USER_KEY}
                </span>
              </td>
              <td className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#295EEF] to-[#1744D6] rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                  {user.FIRST_NAME?.[0]}{user.LAST_NAME?.[0]}
                </div>
                <span 
                  title={user.USER_ID}
                  className="text-sm font-sans text-gray-900 truncate"
                >
                  {user.USER_ID.length > 32 
                    ? `${user.USER_ID.substring(0, 32)}...` 
                    : user.USER_ID
                  }
                </span>
              </td>
              <td className="flex items-center">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.FIRST_NAME} {user.LAST_NAME}
                </div>
              </td>
              <td className="flex items-center">
                <div className="flex items-center text-sm text-gray-600 truncate">
                  <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user.EMAIL_ADDRESS || <span className="text-gray-400 italic">Not provided</span>}</span>
                </div>
              </td>
              <td className="flex items-center">
                <StatusToggle user={user} onStatusChange={handleStatusChange} />
              </td>
              <td className="flex items-center justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      href={`/edit-user/${user.USER_KEY}`}
                      className="inline-flex items-center p-2 text-sm font-medium rounded-lg text-[#295EEF] bg-[#295EEF]/10 hover:bg-[#295EEF]/20 transition-colors duration-150"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit user</p>
                  </TooltipContent>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#295EEF] to-[#1744D6] rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {selectedUser?.FIRST_NAME?.[0]}{selectedUser?.LAST_NAME?.[0]}
            </div>
            <div>
              <div className="text-lg font-semibold">{selectedUser?.FIRST_NAME} {selectedUser?.LAST_NAME}</div>
              <div className="text-sm text-gray-500">{selectedUser?.USER_ID}</div>
            </div>
          </SheetTitle>
          <SheetDescription>
            View and manage user details
          </SheetDescription>
        </SheetHeader>
        
        {selectedUser && (
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Email</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {selectedUser.EMAIL_ADDRESS || <span className="text-gray-400 italic">Not provided</span>}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                {getStatusBadge(selectedUser.STATUS)}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">User ID</h4>
                <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-md break-all">
                  {selectedUser.USER_ID}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button asChild className="flex-1 bg-gradient-to-r from-[#295EEF] to-[#1744D6] hover:from-[#1744D6] hover:to-[#295EEF] text-white">
                <Link href={`/edit-user/${selectedUser.USER_KEY}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
    </TooltipProvider>
  );
}