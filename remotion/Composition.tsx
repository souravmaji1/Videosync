import { AbsoluteFill, Composition, useVideoConfig, Video } from 'remotion';
import { SubtitleOverlay } from '../components/SubtitleOverlay';

type VideoCompositionProps = {
  videoUrl: string;
  subtitle: string;
  subtitlePosition: 'top' | 'middle' | 'bottom';
};

export const VideoComposition = ({
  videoUrl,
  subtitle,
  subtitlePosition
}: VideoCompositionProps) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Video
        src={videoUrl}
        style={{ width, height }}
        startFrom={0} // Start from beginning
        endAt={30 * 30} // End at 30 seconds (30fps * 30)
      />
      {subtitle && <SubtitleOverlay text={subtitle} position={subtitlePosition} />}
    </AbsoluteFill>
  );
};

export const RemotionComposition = () => {
  return (
    <Composition
      id="VideoWithSubtitles"
      component={VideoComposition}
      durationInFrames={30 * 30} // 30 seconds at 30fps
      fps={30}
      width={606}
      height={1080}
      defaultProps={{
        videoUrl: '',
        subtitle: '',
        subtitlePosition: 'bottom'
      }}
    />
  );
};