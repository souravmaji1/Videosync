import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { segments, userId } = await request.json();
    console.log('Render-video API received:', { segments, userId });

    if (!segments || !Array.isArray(segments) || segments.length === 0 || !userId) {
      return NextResponse.json({ error: 'Segments array and userId are required' }, { status: 400 });
    }

    const validStyles = ['none', 'hormozi', 'abdaal', 'neonGlow', 'retroWave', 'minimalPop'];
    const githubToken = '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';
    const repoOwner = 'souravmaji1';
    const repoName = 'Videosync';
    const workflowIds = [];

    for (const segment of segments) {
      const { videoUrls, images, subtitles, styleType, audioUrl, duration, imageDuration, title, description } = segment;

      if (!videoUrls || !duration ) {
        console.warn(`Invalid segment data at index :`, { videoUrls, duration });
        continue;
      }

      if (!validStyles.includes(styleType)) {
        console.warn(`Invalid styleType for segment : ${styleType}`);
        continue;
      }

      if (!subtitles || !Array.isArray(subtitles) || subtitles.some(s => !s.text || !s.start || !s.end)) {
        console.warn(`Invalid subtitles format for segment:`, subtitles);
      }

      const props = {
        videoUrls,
        subtitles: subtitles && Array.isArray(subtitles) ? subtitles : [],
        styleType,
        images,
        imageDuration,
        audioUrl,
        duration,
        outputFile: `rendered_${styleType}_${Date.now()}.mp4`
      };

      // Trigger GitHub Actions workflow
      const dispatchResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_type: 'render-video',
            client_payload: props
          })
        }
      );

      if (!dispatchResponse.ok) {
        const errorData = await dispatchResponse.json();
        console.error(`Failed to trigger workflow for segment :`, errorData);
        continue;
      }

      // Poll for workflow run ID
      let workflowRunId = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const runsResponse = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs`,
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: 'application/vnd.github.v3+json'
            }
          }
        );

        if (!runsResponse.ok) {
          console.error(`Failed to fetch workflow runs for segment `);
          break;
        }

        const runsData = await runsResponse.json();
        const recentRun = runsData.workflow_runs.find(
          run => run.event === 'repository_dispatch' && run.status !== 'completed'
        );

        if (recentRun) {
          workflowRunId = recentRun.id;
          console.log(`Workflow triggered for segment , run ID:`, workflowRunId);

          // Store workflow ID in Supabase
          const inserts = segments.map((segment, index) => ({
  user_id: userId,
  workflow_id: workflowRunId,
  segment_index: index,
  status: 'queued',
  created_at: new Date().toISOString(),
  output_file: props.outputFile,
  title: segment.title || '',
  description: segment.description || ''
}));
const { error } = await supabase.from('render_workflows').insert(inserts);

          if (insertError) {
            console.error(`Failed to store workflow ID for segment :`, insertError);
            continue;
          }

          workflowIds.push({ workflowRunId });
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }

      if (!workflowRunId) {
        console.warn(`Workflow not triggered within timeout for segment `);
      }
    }

    if (workflowIds.length === 0) {
      return NextResponse.json({ error: 'No workflows triggered successfully' }, { status: 500 });
    }

    return NextResponse.json({ workflowIds }, { status: 200 });
  } catch (error) {
    console.error('Error in render-video API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}