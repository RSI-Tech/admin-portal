import { NextRequest, NextResponse } from 'next/server';
import { getCurrentEnvironment, switchEnvironment } from '@/lib/db';

export async function GET() {
  try {
    const envInfo = getCurrentEnvironment();
    return NextResponse.json(envInfo);
  } catch (error) {
    console.error('Error getting environment info:', error);
    return NextResponse.json(
      { error: 'Failed to get environment info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { environment } = await request.json();
    
    if (!environment) {
      return NextResponse.json(
        { error: 'Environment is required' },
        { status: 400 }
      );
    }

    const newEnvConfig = await switchEnvironment(environment);
    
    return NextResponse.json({ 
      success: true, 
      message: `Switched to ${newEnvConfig.name} environment`,
      environment: environment,
      config: newEnvConfig
    });

  } catch (error) {
    console.error('Error switching environment:', error);
    return NextResponse.json(
      { error: 'Failed to switch environment' },
      { status: 500 }
    );
  }
}