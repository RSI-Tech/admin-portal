"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fieldConfig, FieldConfig, FieldOption } from "@/lib/field-config";
import { UserProfiles } from "@/components/user-profiles";
import { Save, X, AlertCircle, Info } from "lucide-react";

interface UserFormProps {
  initialData?: Record<string, any>;
  isEdit?: boolean;
}

export function UserForm({ initialData = {}, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [showOptional, setShowOptional] = useState(false);
  const [userProfiles, setUserProfiles] = useState<string[]>([]);

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
      const url = isEdit ? `/api/users/${initialData.USER_KEY}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";
      
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
      
      // If this is a new user, we need to get the USER_KEY to update profiles
      let userKey = initialData.USER_KEY;
      if (!isEdit && result.userKey) {
        userKey = result.userKey;
      }

      // Update user profiles if we have a userKey
      if (userKey) {
        try {
          const profileResponse = await fetch(`/api/users/${userKey}/profiles`, {
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
        isEdit ? "User updated successfully" : "User added successfully"
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
              "w-full h-11 px-3 py-2 border border-red-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" : 
              "w-full h-11 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            "h-11 border-red-300 focus:ring-red-500 focus:border-red-500 text-sm" : 
            "h-11 border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
          }
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
        {hasError && (
          <p className="text-sm text-red-600">{hasError}</p>
        )}
      </div>
    );
  };

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
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Required Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldConfig.mandatory.map(field => renderField(field, true))}
          </div>
        </div>

        {/* Optional Fields Toggle */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Additional Information
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOptional(!showOptional)}
            >
              {showOptional ? 'Hide' : 'Show'} Optional Fields
            </Button>
          </div>
          
          {showOptional && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldConfig.optional.map(field => renderField(field, false))}
            </div>
          )}
        </div>

        {/* User Profiles Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <UserProfiles
            userKey={isEdit ? initialData.USER_KEY : undefined}
            onProfilesChange={setUserProfiles}
            updatedBy={formData.UPDATED_BY || formData.USER_ID || "SYSTEM"}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting
              ? (isEdit ? "Updating..." : "Adding...")
              : (isEdit ? "Update User" : "Add User")
            }
          </Button>
        </div>
      </form>
    </div>
  );
}