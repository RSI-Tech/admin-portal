import { connectToDatabase, sql } from "@/lib/db";
import { Navigation } from "@/components/navigation";
import { UserForm } from "@/components/user-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

interface EditUserPageProps {
  params: {
    id: string;
  };
}

async function getUser(id: string) {
  try {
    await connectToDatabase();
    const result = await sql.query`SELECT * FROM USERS WHERE USER_KEY = ${id}`;
    await sql.close();
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return result.recordset[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  let user;
  let error = "";

  try {
    user = await getUser(params.id);
    if (!user) {
      redirect("/?error=" + encodeURIComponent("User not found"));
    }
  } catch (err) {
    error = "Failed to load user data";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">{user.FIRST_NAME} {user.LAST_NAME}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="font-sans text-sm">{user.USER_ID}</span>
              </p>
            </div>
          </div>
        </div>

        <UserForm initialData={user} isEdit={true} />
      </div>
    </div>
  );
}