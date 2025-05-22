import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const result = await sql.query`
      SELECT PROFILE_ID, UPDATED_DATE, UPDATED_BY 
      FROM USER_TO_PROFILE 
      WHERE USER_KEY = ${params.id}
      ORDER BY PROFILE_ID
    `;
    
    await sql.close();
    
    return NextResponse.json({ profiles: result.recordset });
    
  } catch (error) {
    console.error('Database error:', error);
    await sql.close();
    return NextResponse.json(
      { error: 'Failed to fetch user profiles: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { profiles, updatedBy } = body;
    
    await connectToDatabase();
    
    // Start a transaction
    const transaction = new sql.Transaction();
    await transaction.begin();
    
    try {
      // Delete existing profiles for this user
      const deleteRequest = new sql.Request(transaction);
      await deleteRequest.query`
        DELETE FROM USER_TO_PROFILE WHERE USER_KEY = ${params.id}
      `;
      
      // Insert new profiles
      for (const profileId of profiles) {
        const insertRequest = new sql.Request(transaction);
        await insertRequest.query`
          INSERT INTO USER_TO_PROFILE (USER_KEY, PROFILE_ID, UPDATED_DATE, UPDATED_BY)
          VALUES (${params.id}, ${profileId}, GETDATE(), ${updatedBy})
        `;
      }
      
      await transaction.commit();
      await sql.close();
      
      return NextResponse.json({ success: true });
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Database error:', error);
    await sql.close();
    return NextResponse.json(
      { error: 'Failed to update user profiles: ' + (error as Error).message },
      { status: 500 }
    );
  }
}