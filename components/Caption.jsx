







import { AbsoluteFill, Composition, useVideoConfig, Video as RemotionVideo } from 'remotion';
import SubtitleOverlay from './SubtitleOverlay';

export const VideoComposition = ({ videoUrl, subtitles, styleType, duration }) => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const expectedDurationInFrames = Math.ceil(duration * fps);

  console.log('VideoComposition rendering:', {
    videoUrl,
    subtitles,
    styleType,
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
        startFrom={0}
        endAt={durationInFrames}
        onError={(e) => console.error('Remotion Video load error:', e)}
      />
      <SubtitleOverlay subtitles={subtitles} styleType={styleType} />
    </AbsoluteFill>
  );
};

export const RemotionComposition = () => {
  return (
    <Composition
      id="VideoWithSubtitles"
      component={VideoComposition}
      durationInFrames={30 * 30}
      fps={30}
      width={606}
      height={1080}
      defaultProps={{
        videoUrl: '',
        subtitles: [],
        styleType: 'none',
        duration: 30
      }}
    />
  );
};