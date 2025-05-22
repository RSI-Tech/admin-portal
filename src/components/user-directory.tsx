'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserTable } from './user-table';

interface User {
  USER_KEY: number;
  USER_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL_ADDRESS?: string;
  STATUS?: string;
}

interface UserDirectoryProps {
  users: User[];
}

export function UserDirectory({ users }: UserDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.USER_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.FIRST_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.LAST_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.EMAIL_ADDRESS?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.STATUS?.toLowerCase() === 'active') ||
      (statusFilter === 'inactive' && user.STATUS?.toLowerCase() === 'inactive');

    return matchesSearch && matchesStatus;
  });

  const toggleUser = (userKey: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userKey)) {
      newSelected.delete(userKey);
    } else {
      newSelected.add(userKey);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.USER_KEY)));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              statusFilter === 'all' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter('active')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              statusFilter === 'active' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter('inactive')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              statusFilter === 'inactive' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Inactive
          </button>
        </div>
      </div>

      {selectedUsers.size > 0 && (
        <div className="mb-4 p-4 bg-[#295EEF]/5 border border-[#295EEF]/20 rounded-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedUsers(new Set())}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <UserTable 
        users={filteredUsers}
        selectedUsers={selectedUsers}
        toggleUser={toggleUser}
        toggleAll={toggleAll}
        allSelected={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
      />
    </div>
  );
}