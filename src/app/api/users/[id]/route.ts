import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, sql } from '@/lib/db';
import { fieldConfig } from '@/lib/field-config';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    await connectToDatabase();
    
    const updates = [];
    const requestParams = [];
    
    [...fieldConfig.mandatory, ...fieldConfig.optional].forEach((field, index) => {
      if (body.hasOwnProperty(field.name)) {
        // Handle special cases for fields that don't allow nulls
        let value = body[field.name];
        if (value === '' || value === null || value === undefined) {
          // Set default values for fields that don't allow nulls
          switch (field.name) {
            case 'CASE_QUEUE_MAX':
              value = 0;
              break;
            case 'PPA_CASE_AMT_LIMIT':
              value = 25000;
              break;
            case 'PPA_DURATION_LIMIT':
              value = 24;
              break;
            case 'CORE':
              value = 4;
              break;
            case 'RESTRICT_CASE_CREATION':
            case 'LOGGED_IN_FLAG':
            case 'OVERRIDE_PROHIBIT_FLAG':
            case 'IGNORE_LOGIN_DATE':
              value = 'N';
              break;
            case 'ENABLE_MFA':
              value = 'Y';
              break;
            default:
              value = null;
          }
        }
        
        updates.push(`${field.name} = @param${index}`);
        requestParams.push({ 
          name: `param${index}`, 
          value: value 
        });
      }
    });
    
    updates.push('UPDATED_DATE = GETDATE()');
    
    const query = `UPDATE USERS SET ${updates.join(', ')} WHERE USER_KEY = @userId`;
    
    const sqlRequest = new sql.Request();
    requestParams.forEach(param => {
      sqlRequest.input(param.name, param.value);
    });
    sqlRequest.input('userId', params.id);
    
    await sqlRequest.query(query);
    await sql.close();
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Database error:', error);
    await sql.close();
    return NextResponse.json(
      { error: 'Failed to update user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}