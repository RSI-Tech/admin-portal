"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiFetch } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Users, User, CheckCircle } from "lucide-react";

interface UserProfile {
  PROFILE_ID: string;
  UPDATED_DATE: string;
  UPDATED_BY: string;
}

interface UserProfilesProps {
  userKey?: number;
  onProfilesChange: (profiles: string[]) => void;
  updatedBy: string;
  initialProfiles?: string[];
}

export function UserProfiles({ userKey, onProfilesChange, updatedBy, initialProfiles }: UserProfilesProps) {
  const [currentProfiles, setCurrentProfiles] = useState<UserProfile[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<string[]>([]);
  const [selectedNewProfile, setSelectedNewProfile] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchAvailableProfiles = async () => {
    try {
      const data = await apiGet('/api/profiles');
      setAvailableProfiles(data.profiles);
    } catch (error) {
      console.error('Failed to fetch available profiles:', error);
    }
  };

  const fetchUserProfiles = useCallback(async () => {
    if (!userKey) return;
    
    try {
      const response = await apiFetch(`/api/users/${userKey}/profiles`);
      if (response.ok) {
        const data = await response.json();
        setCurrentProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch user profiles:', error);
    }
  }, [userKey]);

  // Handle initial profiles for duplicate mode
  useEffect(() => {
    if (initialProfiles && initialProfiles.length > 0) {
      const profilesData = initialProfiles.map(profileId => ({
        PROFILE_ID: profileId,
        UPDATED_DATE: new Date().toISOString(),
        UPDATED_BY: updatedBy
      }));
      setCurrentProfiles(profilesData);
    }
  }, [initialProfiles, updatedBy]);

  // Fetch available profiles and current user profiles
  useEffect(() => {
    fetchAvailableProfiles();
    if (userKey && !initialProfiles) {
      fetchUserProfiles();
    }
  }, [userKey, initialProfiles, fetchUserProfiles]);

  // Notify parent only on initial load and user actions (not on every currentProfiles change)
  useEffect(() => {
    // Only notify on initial load from fetch or initialProfiles
    if (initialProfiles && initialProfiles.length > 0) {
      onProfilesChange(initialProfiles);
    }
  }, [initialProfiles, onProfilesChange]);

  useEffect(() => {
    // Only notify when profiles are loaded from API (not initialProfiles)
    if (userKey && !initialProfiles && currentProfiles.length > 0) {
      onProfilesChange(currentProfiles.map(p => p.PROFILE_ID));
    }
  }, [userKey, initialProfiles, currentProfiles, onProfilesChange]);

  const addProfile = () => {
    if (!selectedNewProfile) return;
    
    const newProfile: UserProfile = {
      PROFILE_ID: selectedNewProfile,
      UPDATED_DATE: new Date().toISOString(),
      UPDATED_BY: updatedBy
    };
    
    const updatedProfiles = [...currentProfiles, newProfile];
    setCurrentProfiles(updatedProfiles);
    setSelectedNewProfile("");
    
    // Notify parent component
    onProfilesChange(updatedProfiles.map(p => p.PROFILE_ID));
  };

  const removeProfile = (profileId: string) => {
    const updatedProfiles = currentProfiles.filter(p => p.PROFILE_ID !== profileId);
    setCurrentProfiles(updatedProfiles);
    
    // Notify parent component
    onProfilesChange(updatedProfiles.map(p => p.PROFILE_ID));
  };

  const getAvailableProfilesForSelection = () => {
    const currentProfileIds = currentProfiles.map(p => p.PROFILE_ID);
    return availableProfiles.filter(profile => !currentProfileIds.includes(profile));
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">User Profiles</h4>
            <p className="text-sm text-gray-500">Manage user access and permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {currentProfiles.length} Active
          </div>
        </div>
      </div>

      {/* Current Profiles Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-700">Assigned Profiles</h5>
          {currentProfiles.length > 0 && (
            <span className="text-xs text-gray-400">Click × to remove</span>
          )}
        </div>
        
        {currentProfiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {currentProfiles.map((profile, index) => (
              <div
                key={profile.PROFILE_ID}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{profile.PROFILE_ID}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Updated by <span className="font-medium">{profile.UPDATED_BY}</span> on{' '}
                        {new Date(profile.UPDATED_DATE).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProfile(profile.PROFILE_ID)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="Remove profile"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-gray-400" />
            </div>
            <h6 className="text-sm font-medium text-gray-900 mb-1">No profiles assigned</h6>
            <p className="text-xs text-gray-500">Add a profile below to grant user permissions</p>
          </div>
        )}
      </div>

      {/* Add New Profile Section */}
      {getAvailableProfilesForSelection().length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-green-600" />
            <h5 className="text-sm font-medium text-gray-700">Add New Profile</h5>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <select 
                value={selectedNewProfile}
                onChange={(e) => setSelectedNewProfile(e.target.value)}
                className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
              >
                <option value="" className="text-gray-500">Choose a profile to assign...</option>
                {getAvailableProfilesForSelection().map((profile) => (
                  <option key={profile} value={profile} className="text-gray-900">
                    {profile}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addProfile}
              disabled={!selectedNewProfile}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Profile
            </button>
          </div>
        </div>
      )}

      {getAvailableProfilesForSelection().length === 0 && currentProfiles.length > 0 && (
        <div className="text-center py-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-700 text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            All available profiles have been assigned
          </div>
        </div>
      )}
    </div>
  );
}