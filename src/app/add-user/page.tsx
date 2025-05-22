import { UserForm } from "@/components/user-form";
import { UserPlus } from "lucide-react";

export default function AddUserPage() {
  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#295EEF] to-[#1744D6] rounded-xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add New User</h1>
            <p className="text-base leading-6 text-gray-600 mt-1">
              Create a new user account with the required permissions
            </p>
          </div>
        </div>
      </div>

      <UserForm />
    </div>
  );
}