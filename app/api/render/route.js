// app/api/render/route.js
import { renderMediaOnLambda } from '@remotion/lambda-client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { videoUrl, subtitle, subtitlePosition } = await request.json();

    // Start the render on Lambda
    const { renderId, bucketName } = await renderMediaOnLambda({
      region: 'us-east-1',
      functionName: 'remotion-render',
      serveUrl: process.env.REMOTION_SERVE_URL || 'your-serve-url',
      composition: {
        id: 'SubtitleVideo',
        durationInFrames: Math.ceil(30 * 30), // 30 seconds at 30fps
        fps: 30,
        width: 607,
        height: 1080,
        defaultProps: {
          videoUrl,
          subtitle,
          subtitlePosition
        }
      },
      inputProps: {
        videoUrl,
        subtitle,
        subtitlePosition
      },
      codec: 'h264',
      maxRetries: 1,
    });

    // Return the render ID and bucket name to poll progress
    return NextResponse.json({ renderId, bucketName });
  } catch (error) {
    console.error('Lambda render error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start render',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}