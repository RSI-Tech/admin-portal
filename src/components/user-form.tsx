"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fieldConfig, FieldConfig, FieldOption } from "@/lib/field-config";
import { UserProfiles } from "@/components/user-profiles";
import { Save, X, AlertCircle, Info, Copy } from "lucide-react";

interface UserFormProps {
  initialData?: Record<string, any>;
  isEdit?: boolean;
  mode?: 'add' | 'edit' | 'duplicate';
  userKey?: number;
}

export function UserForm({ initialData = {}, isEdit = false, mode = 'add', userKey }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [showOptional, setShowOptional] = useState(false);
  const [userProfiles, setUserProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(mode === 'duplicate');

  const handleProfilesChange = useCallback((profiles: string[]) => {
    setUserProfiles(profiles);
  }, []);

  // Fetch user data for duplicate mode
  useEffect(() => {
    if (mode === 'duplicate' && userKey) {
      const fetchUserData = async () => {
        try {
          // Fetch user data
          const userResponse = await fetch(`/api/users/${userKey}`);
          if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await userResponse.json();
          
          // Fetch user profiles
          const profilesResponse = await fetch(`/api/users/${userKey}/profiles`);
          let originalProfiles: string[] = [];
          if (profilesResponse.ok) {
            const profilesData = await profilesResponse.json();
            // Extract just the PROFILE_ID from each profile object
            originalProfiles = (profilesData.profiles || []).map((p: any) => p.PROFILE_ID);
          }
          
          // Clear fields that should be unique for the new user
          const cleanedData = { ...userData };
          delete cleanedData.USER_KEY;
          delete cleanedData.UPDATED_DATE;
          delete cleanedData.EFFECTIVE_BEGIN_DT;
          delete cleanedData.PASSWORD_CHANGED_DATE;
          
          // Clear USER_ID to force user to enter a new one
          cleanedData.USER_ID = '';
          
          setFormData(cleanedData);
          setUserProfiles(originalProfiles); // Set the profiles to be copied
          setShowOptional(true); // Show optional fields since we have data to display
        } catch (error) {
          console.error('Error fetching user data:', error);
          setSubmitError('Failed to load user data for duplication');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [mode, userKey]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fieldConfig.mandatory.forEach(field => {
      if (!formData[field.name] || formData[field.name].trim() === "") {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // For duplicate mode, always use POST to create a new user
      const url = isEdit ? `/api/users/${initialData.USER_KEY}` : "/api/users";
      const method = (isEdit && mode !== 'duplicate') ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to save user");
      }

      const result = await response.json();
      
      // If this is a new user or duplicate, we need to get the USER_KEY to update profiles
      let targetUserKey = initialData.USER_KEY;
      if ((!isEdit || mode === 'duplicate') && result.userKey) {
        targetUserKey = result.userKey;
      }

      // Update user profiles if we have a userKey
      if (targetUserKey) {
        try {
          const profileResponse = await fetch(`/api/users/${targetUserKey}/profiles`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profiles: userProfiles || [],
              updatedBy: formData.UPDATED_BY || formData.USER_ID || "SYSTEM"
            }),
          });

          if (!profileResponse.ok) {
            const profileError = await profileResponse.text();
            console.warn("Failed to update user profiles:", profileError);
            // Don't fail the entire operation for profile update issues
          }
        } catch (profileError) {
          console.warn("Profile update error:", profileError);
          // Continue with success message even if profiles failed
        }
      }

      router.push("/?success=" + encodeURIComponent(
        isEdit ? "User updated successfully" : 
        mode === 'duplicate' ? "User duplicated successfully" : 
        "User added successfully"
      ));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FieldConfig, isRequired: boolean) => {
    const value = formData[field.name] || "";
    const hasError = errors[field.name];

    if (field.type === "select" && field.options) {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
            {field.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <select
            id={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={hasError ? 
              "w-full h-11 px-3 py-2 border border-red-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200" : 
              "w-full h-11 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
            }
          >
            <option value="" className="text-gray-500">Select {field.label}</option>
            {field.options.map((option, index) => {
              const optionValue = typeof option === "string" ? option : (option as FieldOption).value;
              const optionLabel = typeof option === "string" ? option : (option as FieldOption).label;
              return (
                <option key={index} value={optionValue} className="text-gray-900">
                  {optionLabel}
                </option>
              );
            })}
          </select>
          {hasError && (
            <p className="text-sm text-red-600">{hasError}</p>
          )}
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={field.name}
          type={field.type}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          maxLength={field.maxLength}
          className={hasError ? 
            "h-11 border-red-300 focus:ring-red-500 focus:border-red-500 text-sm rounded-lg transition-all duration-200" : 
            "h-11 border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm rounded-lg transition-all duration-200 hover:border-gray-400"
          }
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
        {hasError && (
          <p className="text-sm text-red-600">{hasError}</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data for duplication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Required Fields */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Required Information</h3>
              <p className="text-sm text-gray-500">These fields must be completed</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldConfig.mandatory.map(field => renderField(field, true))}
          </div>
        </div>

        {/* Optional Fields Toggle */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                <p className="text-sm text-gray-500">Optional fields for more details</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOptional(!showOptional)}
              className="border-gray-300 hover:bg-gray-50"
            >
              {showOptional ? 'Hide' : 'Show'} Fields
            </Button>
          </div>
          
          {showOptional && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {fieldConfig.optional.map(field => renderField(field, false))}
            </div>
          )}
        </div>

        {/* User Profiles Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          {mode === 'duplicate' && userProfiles.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {userProfiles.length} profile{userProfiles.length !== 1 ? 's' : ''} copied from original user
                </span>
              </div>
            </div>
          )}
          <UserProfiles
            userKey={isEdit && mode !== 'duplicate' ? initialData.USER_KEY : undefined}
            onProfilesChange={handleProfilesChange}
            updatedBy={formData.UPDATED_BY || formData.USER_ID || "SYSTEM"}
            initialProfiles={mode === 'duplicate' ? userProfiles : undefined}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end sticky bottom-0 bg-gradient-to-t from-gray-50 to-transparent pt-6 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            disabled={isSubmitting}
            className="px-6 shadow-sm border-gray-300 hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting
              ? (isEdit ? "Updating..." : mode === 'duplicate' ? "Duplicating..." : "Adding...")
              : (isEdit ? "Update User" : mode === 'duplicate' ? "Duplicate User" : "Add User")
            }
          </Button>
        </div>
      </form>
    </div>
  );
}