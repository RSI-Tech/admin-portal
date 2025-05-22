import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, sql } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const userKey = parseInt(resolvedParams.id);

    if (!userKey || isNaN(userKey)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be Active or Inactive' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await sql.query`
      UPDATE USERS 
      SET STATUS = ${status}
      WHERE USER_KEY = ${userKey}
    `;

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `User status updated to ${status}` 
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}