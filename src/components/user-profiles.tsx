"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface UserProfile {
  PROFILE_ID: string;
  UPDATED_DATE: string;
  UPDATED_BY: string;
}

interface UserProfilesProps {
  userKey?: number;
  onProfilesChange: (profiles: string[]) => void;
  updatedBy: string;
}

export function UserProfiles({ userKey, onProfilesChange, updatedBy }: UserProfilesProps) {
  const [currentProfiles, setCurrentProfiles] = useState<UserProfile[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<string[]>([]);
  const [selectedNewProfile, setSelectedNewProfile] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch available profiles and current user profiles
  useEffect(() => {
    fetchAvailableProfiles();
    if (userKey) {
      fetchUserProfiles();
    }
  }, [userKey]);

  // Notify parent of initial profiles when they load
  useEffect(() => {
    onProfilesChange(currentProfiles.map(p => p.PROFILE_ID));
  }, [currentProfiles]);

  const fetchAvailableProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const data = await response.json();
        setAvailableProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch available profiles:', error);
    }
  };

  const fetchUserProfiles = async () => {
    if (!userKey) return;
    
    try {
      const response = await fetch(`/api/users/${userKey}/profiles`);
      if (response.ok) {
        const data = await response.json();
        setCurrentProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch user profiles:', error);
    }
  };

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">User Profiles</h4>
        <span className="text-sm text-gray-500">
          {currentProfiles.length} profile{currentProfiles.length !== 1 ? 's' : ''} assigned
        </span>
      </div>

      {/* Current Profiles */}
      <div className="space-y-3">
        {currentProfiles.length > 0 ? (
          currentProfiles.map((profile) => (
            <div
              key={profile.PROFILE_ID}
              className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">
                  {profile.PROFILE_ID}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Updated by {profile.UPDATED_BY} on{' '}
                  {new Date(profile.UPDATED_DATE).toLocaleDateString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProfile(profile.PROFILE_ID)}
                className="ml-4 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            No profiles assigned
          </div>
        )}
      </div>

      {/* Add New Profile */}
      {getAvailableProfilesForSelection().length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <select 
                value={selectedNewProfile}
                onChange={(e) => setSelectedNewProfile(e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="" className="text-gray-500">Select a profile to add</option>
                {getAvailableProfilesForSelection().map((profile) => (
                  <option key={profile} value={profile} className="text-gray-900 py-2">
                    {profile}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addProfile}
              disabled={!selectedNewProfile}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      )}

      {getAvailableProfilesForSelection().length === 0 && currentProfiles.length > 0 && (
        <div className="text-sm text-gray-500 text-center py-3 bg-gray-50 rounded-lg">
          All available profiles have been assigned
        </div>
      )}
    </div>
  );
}