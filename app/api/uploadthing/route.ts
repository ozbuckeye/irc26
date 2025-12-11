import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';
import { NextRequest, NextResponse } from 'next/server';

// UploadThing v7 supports both patterns:
// 1. New: UPLOADTHING_TOKEN (single token, recommended for v7)
// 2. Legacy: UPLOADTHING_SECRET + UPLOADTHING_APP_ID (still supported)

// Validate environment variables at module load
const hasToken = !!process.env.UPLOADTHING_TOKEN;
const hasSecret = !!process.env.UPLOADTHING_SECRET;
const hasAppId = !!process.env.UPLOADTHING_APP_ID;

if (!hasToken && !hasSecret) {
  console.error('❌ UploadThing configuration error:');
  console.error('   Either UPLOADTHING_TOKEN (v7 recommended) or UPLOADTHING_SECRET must be set');
  console.error('   UploadThing uploads will fail without proper configuration.');
}

if (hasSecret && !hasAppId) {
  console.warn('⚠️  UPLOADTHING_APP_ID is missing (optional but recommended when using UPLOADTHING_SECRET)');
}

// Create the route handler with appropriate config
// UploadThing v7 can auto-read from env, but we'll pass config explicitly for better error handling
const createHandler = () => {
  // Try v7 token first (recommended)
  if (hasToken) {
    console.log('✅ Using UploadThing v7 token-based authentication');
    return createRouteHandler({
      router: ourFileRouter,
      config: {
        token: process.env.UPLOADTHING_TOKEN!,
      },
    });
  }
  
  // Fall back to legacy secret-based authentication  
  if (hasSecret) {
    console.log('✅ Using UploadThing legacy secret-based authentication');
    return createRouteHandler({
      router: ourFileRouter,
    });
  }

  // If neither is set, try without config (UploadThing might auto-read from env)
  console.warn('⚠️  No UploadThing config found, attempting auto-detection from env...');
  return createRouteHandler({
    router: ourFileRouter,
  });
};

// Create handlers with error handling
let handlers: { GET: typeof GET; POST: typeof POST } | null = null;

try {
  handlers = createHandler();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('❌ Failed to create UploadThing handler:', message);
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!handlers) {
    const errorMsg = hasToken || hasSecret
      ? 'Handler initialization failed'
      : 'UPLOADTHING_TOKEN or UPLOADTHING_SECRET is missing from environment variables';
    
    console.error(`UploadThing GET: ${errorMsg}`);
    return NextResponse.json(
      { 
        error: 'UploadThing configuration error',
        message: errorMsg
      },
      { status: 500 }
    );
  }

  try {
    return await handlers.GET(request);
  } catch (error: unknown) {
    console.error('UploadThing GET error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'UploadThing server error',
        message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!handlers) {
    const errorMsg = hasToken || hasSecret
      ? 'Handler initialization failed'
      : 'UPLOADTHING_TOKEN or UPLOADTHING_SECRET is missing from environment variables';
    
    console.error(`UploadThing POST: ${errorMsg}`);
    return NextResponse.json(
      { 
        error: 'UploadThing configuration error',
        message: errorMsg
      },
      { status: 500 }
    );
  }

  try {
    return await handlers.POST(request);
  } catch (error: unknown) {
    console.error('UploadThing POST error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'UploadThing server error',
        message
      },
      { status: 500 }
    );
  }
}



