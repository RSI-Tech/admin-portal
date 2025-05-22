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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
          <p className="text-gray-600 mt-1">
            {user.FIRST_NAME} {user.LAST_NAME} ({user.USER_ID})
          </p>
        </div>

        <UserForm initialData={user} isEdit={true} />
      </div>
    </div>
  );
}