import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, sql, switchEnvironment, getCurrentEnvironment } from '@/lib/db';
import { fieldConfig } from '@/lib/field-config';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { targetEnvironment } = body;
    
    if (!targetEnvironment) {
      return NextResponse.json(
        { error: 'Target environment is required' },
        { status: 400 }
      );
    }

    const userKey = parseInt(params.id);
    if (isNaN(userKey)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get current environment
    const currentEnv = getCurrentEnvironment();
    
    if (currentEnv.current === targetEnvironment) {
      return NextResponse.json(
        { error: 'Cannot migrate user to the same environment' },
        { status: 400 }
      );
    }

    // Validate target environment exists
    const configPath = path.join(process.cwd(), 'connection.json');
    const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!configFile.environments[targetEnvironment]) {
      return NextResponse.json(
        { error: `Target environment '${targetEnvironment}' not found` },
        { status: 400 }
      );
    }

    // Connect to source environment and fetch user data
    await connectToDatabase();
    
    // Get user data (excluding USER_KEY)
    const userQuery = `SELECT * FROM USERS WHERE USER_KEY = @userKey`;
    const userRequest = new sql.Request();
    userRequest.input('userKey', userKey);
    const userResult = await userRequest.query(userQuery);
    
    if (userResult.recordset.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const userData = userResult.recordset[0];
    const { USER_KEY: sourceUserKey, ...userDataWithoutKey } = userData;
    
    // Get user profiles
    const profilesQuery = `SELECT PROFILE_ID FROM USER_TO_PROFILE WHERE USER_KEY = @userKey`;
    const profilesRequest = new sql.Request();
    profilesRequest.input('userKey', userKey);
    const profilesResult = await profilesRequest.query(profilesQuery);
    const userProfiles = profilesResult.recordset.map(row => row.PROFILE_ID);

    // Switch to target environment
    await switchEnvironment(targetEnvironment);
    await connectToDatabase();

    // Check if user already exists in target environment by USER_ID
    if (userData.USER_ID) {
      const checkQuery = `SELECT USER_KEY FROM USERS WHERE USER_ID = @userId`;
      const checkRequest = new sql.Request();
      checkRequest.input('userId', userData.USER_ID);
      const checkResult = await checkRequest.query(checkQuery);
      
      if (checkResult.recordset.length > 0) {
        // Switch back to original environment
        await switchEnvironment(currentEnv.current);
        
        return NextResponse.json(
          { error: `User with USER_ID '${userData.USER_ID}' already exists in ${targetEnvironment} environment` },
          { status: 409 }
        );
      }
    }

    // Start transaction for migration
    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      // Insert user data (excluding USER_KEY)
      const fields: string[] = [];
      const values: string[] = [];
      const insertParams: { name: string; value: any }[] = [];
      
      // Get all field names from field config
      const allFields = [...fieldConfig.mandatory, ...fieldConfig.optional];
      
      allFields.forEach((field, index) => {
        if (userDataWithoutKey.hasOwnProperty(field.name) && userDataWithoutKey[field.name] !== null) {
          fields.push(field.name);
          values.push(`@param${index}`);
          insertParams.push({ name: `param${index}`, value: userDataWithoutKey[field.name] });
        }
      });

      // Add system fields
      fields.push('UPDATED_DATE');
      values.push('GETDATE()');

      const insertQuery = `
        INSERT INTO USERS (${fields.join(', ')}) 
        VALUES (${values.join(', ')});
        SELECT SCOPE_IDENTITY() as USER_KEY;
      `;

      const insertRequest = new sql.Request(transaction);
      insertParams.forEach(param => {
        insertRequest.input(param.name, param.value);
      });

      const insertResult = await insertRequest.query(insertQuery);
      const newUserKey = insertResult.recordset[0]?.USER_KEY;

      if (!newUserKey) {
        throw new Error('Failed to get new USER_KEY after migration');
      }

      // Migrate user profiles
      for (const profileId of userProfiles) {
        const profileInsertRequest = new sql.Request(transaction);
        await profileInsertRequest.query`
          INSERT INTO USER_TO_PROFILE (USER_KEY, PROFILE_ID, UPDATED_DATE, UPDATED_BY)
          VALUES (${newUserKey}, ${profileId}, GETDATE(), 'MIGRATION')
        `;
      }

      await transaction.commit();

      // Switch back to original environment
      await switchEnvironment(currentEnv.current);

      return NextResponse.json({ 
        success: true, 
        newUserKey,
        migratedProfiles: userProfiles.length,
        targetEnvironment 
      });

    } catch (error) {
      await transaction.rollback();
      // Switch back to original environment
      await switchEnvironment(currentEnv.current);
      throw error;
    }

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}