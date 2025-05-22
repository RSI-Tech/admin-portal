import { Navigation } from "@/components/navigation";
import { UserForm } from "@/components/user-form";
import { UserPlus } from "lucide-react";

export default function AddUserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
              <p className="text-gray-600 mt-1">
                Create a new user account with the required permissions
              </p>
            </div>
          </div>
        </div>

        <UserForm />
      </div>
    </div>
  );
}