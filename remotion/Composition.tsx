import { AbsoluteFill, Composition, useVideoConfig, Video as RemotionVideo } from 'remotion';
import SubtitleOverlay from '../components/SubtitleOverlay';

type VideoCompositionProps = {
  videoUrl: string;
  subtitles: { text: string; start: number; end: number }[];
  subtitlePosition: 'top' | 'middle' | 'bottom';
  duration: number; // Duration in seconds
};

export const VideoComposition = ({
  videoUrl,
  subtitles,
  subtitlePosition,
  duration
}: VideoCompositionProps) => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const expectedDurationInFrames = Math.ceil(duration * fps);

  console.log('VideoComposition rendering:', {
    videoUrl,
    subtitles,
    subtitlePosition,
    duration,
    durationInFrames,
    expectedDurationInFrames,
    fps
  });

  return (
    <AbsoluteFill>
      <RemotionVideo
        src={videoUrl}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted // Required for auto-play in some browsers
        startFrom={0}
        endAt={durationInFrames}
        onError={(e) => console.error('Remotion Video load error:', e)}
      />
      <SubtitleOverlay subtitles={subtitles} position={subtitlePosition} />
    </AbsoluteFill>
  );
};

export const RemotionComposition = () => {
  return (
    <Composition
      id="VideoWithSubtitles"
      component={VideoComposition}
      durationInFrames={30 * 30} // Default, overridden by props
      fps={30}
      width={606}
      height={1080}
      defaultProps={{
        videoUrl: '',
        subtitles: [],
        subtitlePosition: 'bottom',
        duration: 30
      }}
    />
  );
};