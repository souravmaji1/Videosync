import { createClient } from "@deepgram/sdk";

export async function POST(request) {
  try {
    const { videoUrl, segmentStart } = await request.json();

    if (!videoUrl || segmentStart === undefined) {
      return new Response(JSON.stringify({ error: "Missing videoUrl or segmentStart" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Deepgram client
    const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

    // Transcribe the video
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: videoUrl },
      {
        model: "nova-3",
        punctuate: true,
        utterances: true,
        paragraphs: true,
        smart_format: true
      }
    );

    if (error) {
      console.error('Deepgram error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Unexpected error in transcription:', err);
    return new Response(JSON.stringify({ error: 'Failed to transcribe video' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}