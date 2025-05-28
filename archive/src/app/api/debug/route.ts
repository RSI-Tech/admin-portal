import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    url: request.url,
    pathname: request.nextUrl.pathname,
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-prefix': request.headers.get('x-forwarded-prefix'),
      'x-original-url': request.headers.get('x-original-url'),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}