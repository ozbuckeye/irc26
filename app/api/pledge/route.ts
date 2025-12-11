import { NextRequest, NextResponse } from 'next/server';

// This endpoint is deprecated - pledges are now created via /api/pledges with authentication
export async function POST(request: NextRequest) {
  try {
    await request.json();
    return NextResponse.json(
      { error: 'This endpoint is deprecated. Please use /api/pledges with authentication.' },
      { status: 410 }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
