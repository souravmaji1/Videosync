// app/api/render-progress/route.js
import { getRenderProgress } from '@remotion/lambda-client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { renderId, bucketName } = await request.json();
    
    const progress = await getRenderProgress({
      region: 'us-east-1',
      functionName: 'remotion-render',
      renderId,
      bucketName,
    });

    return NextResponse.json({
      progress: progress.overallProgress,
      status: progress.fatalErrorEncountered ? 'error' : progress.done ? 'done' : 'rendering',
      outputUrl: progress.outputFile,
      errors: progress.errors
    });
  } catch (error) {
    console.error('Progress check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check progress',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}