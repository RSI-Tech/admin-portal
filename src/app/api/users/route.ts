import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, sql } from '@/lib/db';
import { fieldConfig } from '@/lib/field-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await connectToDatabase();
    
    const fields: string[] = [];
    const values: string[] = [];
    const params: { name: string; value: any }[] = [];
    
    [...fieldConfig.mandatory, ...fieldConfig.optional].forEach((field, index) => {
      if (body[field.name] && body[field.name].toString().trim() !== '') {
        fields.push(field.name);
        values.push(`@param${index}`);
        params.push({ name: `param${index}`, value: body[field.name] });
      }
    });
    
    // Add system-generated fields
    fields.push('UPDATED_DATE', 'EFFECTIVE_BEGIN_DT', 'PASSWORD_CHANGED_DATE');
    values.push('GETDATE()', 'GETDATE()', 'GETDATE()');
    
    // Add default values
    fields.push('CASE_QUEUE_MAX', 'RESTRICT_CASE_CREATION', 'PPA_CASE_AMT_LIMIT', 'PPA_DURATION_LIMIT', 'CORE', 'LOGGED_IN_FLAG', 'OVERRIDE_PROHIBIT_FLAG', 'IGNORE_LOGIN_DATE', 'ENABLE_MFA');
    values.push('0', "'N'", '25000', '24', '4', "'N'", "'N'", "'N'", "'Y'");
    
    const query = `
      INSERT INTO USERS (${fields.join(', ')}) 
      VALUES (${values.join(', ')});
      SELECT SCOPE_IDENTITY() as USER_KEY;
    `;
    
    const sqlRequest = new sql.Request();
    params.forEach(param => {
      sqlRequest.input(param.name, param.value);
    });
    
    const result = await sqlRequest.query(query);
    const userKey = result.recordset[0]?.USER_KEY;
    
    
    return NextResponse.json({ success: true, userKey });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}