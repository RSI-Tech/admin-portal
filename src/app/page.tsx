import { connectToDatabase, sql } from "@/lib/db";
import { Navigation } from "@/components/navigation";
import { SuccessAlert } from "@/components/success-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Edit } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

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

function getStatusBadge(status?: string) {
  if (!status) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
  
  switch (status.toLowerCase()) {
    case 'active':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    case 'inactive':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    case 'suspended':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended</span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  }
}

export default async function UsersPage() {
  const { users, error } = await getUsers();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/add-user">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        </div>

        <Suspense fallback={null}>
          <SuccessAlert />
        </Suspense>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={user.USER_KEY} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        <span 
                          title={user.USER_ID}
                          className="block max-w-xs truncate"
                        >
                          {user.USER_ID.length > 32 
                            ? `${user.USER_ID.substring(0, 29)}...` 
                            : user.USER_ID
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.FIRST_NAME} {user.LAST_NAME}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.EMAIL_ADDRESS || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.STATUS)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/edit-user/${user.USER_KEY}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first user.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/add-user">
                  Add First User
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}