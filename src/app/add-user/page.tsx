import { Navigation } from "@/components/navigation";
import { UserForm } from "@/components/user-form";

export default function AddUserPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add New User</h1>
          <p className="text-gray-600 mt-1">
            Create a new user account in the system
          </p>
        </div>

        <UserForm />
      </div>
    </div>
  );
}