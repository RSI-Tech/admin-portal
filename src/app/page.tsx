import { connectToDatabase, sql } from "@/lib/db";
import { SuccessAlert } from "@/components/success-alert";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { UserDirectory } from "@/components/user-directory";

interface User {
  USER_KEY: number;
  USER_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL_ADDRESS?: string;
  STATUS?: string;
}

async function getUsers(): Promise<{ users: User[], error?: string }> {
  try {
    await connectToDatabase();
    const result = await sql.query`
      SELECT USER_KEY, USER_ID, FIRST_NAME, LAST_NAME, STATUS, EMAIL_ADDRESS 
      FROM USERS 
      ORDER BY LAST_NAME, FIRST_NAME
    `;
    await sql.close();
    return { users: result.recordset };
  } catch (error) {
    console.error('Database error:', error);
    return { users: [], error: 'Failed to load users' };
  }
}


export default async function UsersPage() {
  const { users, error } = await getUsers();

  return (
    <div className="py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-gray-900">User Directory</h1>
              <p className="text-sm text-gray-600">
                Manage system users and their access permissions
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-[#295EEF] to-[#1744D6] hover:from-[#1744D6] hover:to-[#295EEF] text-white shadow-md">
              <Link href="/add-user">
                <UserPlus className="mr-2 h-4 w-4" />
                Add user
              </Link>
            </Button>
          </div>
        </div>

        <Suspense fallback={null}>
          <SuccessAlert />
        </Suspense>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <UserDirectory users={users} />
      </div>
  );
}