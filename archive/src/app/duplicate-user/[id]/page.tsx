import { UserForm } from "@/components/user-form";
import { Copy } from "lucide-react";

export default async function DuplicateUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Copy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Duplicate User</h1>
            <p className="text-base leading-6 text-gray-600 mt-1">
              Create a new user based on an existing user template. Please modify the required fields before saving.
            </p>
          </div>
        </div>
      </div>

      <UserForm mode="duplicate" userKey={parseInt(resolvedParams.id)} />
    </div>
  );
}