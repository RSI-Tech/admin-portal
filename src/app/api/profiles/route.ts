import { NextResponse } from 'next/server';
import { connectToDatabase, sql } from '@/lib/db';

export async function GET() {
  try {
    await connectToDatabase();
    
    const result = await sql.query`
      SELECT DISTINCT PROFILE_ID, COUNT(*) as user_count 
      FROM USER_TO_PROFILE 
      GROUP BY PROFILE_ID 
      ORDER BY user_count DESC, PROFILE_ID ASC
    `;
    
    await sql.close();
    
    return NextResponse.json({ 
      profiles: result.recordset.map(row => row.PROFILE_ID) 
    });
    
  } catch (error) {
    console.error('Database error:', error);
    await sql.close();
    return NextResponse.json(
      { error: 'Failed to fetch profiles: ' + (error as Error).message },
      { status: 500 }
    );
  }
}