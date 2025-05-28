import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, sql } from '@/lib/db';
import { fieldConfig } from '@/lib/field-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await connectToDatabase();
    
    // Check if USER_ID already exists
    if (body.USER_ID) {
      const checkQuery = `SELECT COUNT(*) as count FROM USERS WHERE USER_ID = @userId`;
      const checkRequest = new sql.Request();
      checkRequest.input('userId', body.USER_ID);
      const checkResult = await checkRequest.query(checkQuery);
      
      if (checkResult.recordset[0].count > 0) {
        return NextResponse.json(
          { error: `User ID '${body.USER_ID}' already exists. Please choose a different User ID.` },
          { status: 409 }
        );
      }
    }
    
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
    
    // Add default values for fields that weren't provided
    const defaultFields = [
      { name: 'CASE_QUEUE_MAX', value: '0' },
      { name: 'RESTRICT_CASE_CREATION', value: "'N'" },
      { name: 'PPA_CASE_AMT_LIMIT', value: '25000' },
      { name: 'PPA_DURATION_LIMIT', value: '24' },
      { name: 'CORE', value: '4' },
      { name: 'LOGGED_IN_FLAG', value: "'N'" },
      { name: 'OVERRIDE_PROHIBIT_FLAG', value: "'N'" },
      { name: 'IGNORE_LOGIN_DATE', value: "'N'" },
      { name: 'ENABLE_MFA', value: "'Y'" }
    ];

    defaultFields.forEach(defaultField => {
      if (!fields.includes(defaultField.name)) {
        fields.push(defaultField.name);
        values.push(defaultField.value);
      }
    });
    
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