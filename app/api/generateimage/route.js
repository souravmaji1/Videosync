// app/api/generate-images/route.js
export async function POST(request) {
  console.log('Processing image generation request');

  try {
    const body = await request.json();
    const { modelPath, input } = body;

    console.log(`Request for model: ${modelPath}`);

    if (!modelPath || !input) {
      console.error('Error: Missing model path or input in request');
      return new Response(
        JSON.stringify({ error: 'Missing model path or input' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Sending request to Replicate API');
    const response = await fetch(
      `https://api.replicate.com/v1/models/${modelPath}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'wait',
        },
        body: JSON.stringify({ input }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Replicate API error:', data);
      return new Response(
        JSON.stringify({
          error: data.detail || 'Error from Replicate API',
          statusCode: response.status,
          raw: data,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully generated image', data.id);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled exception in image generation API:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}