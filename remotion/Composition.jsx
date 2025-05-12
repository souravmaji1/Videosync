// src/remotion/Composition.jsx

import { Composition, AbsoluteFill, useVideoConfig, Video as RemotionVideo, Img, Sequence, Audio } from 'remotion';
import SubtitleOverlay from '../components/SubtitleOverlay';

// VideoComposition component for rendering video or image slideshow
export const VideoComposition = ({
  videoUrls,
  images,
  subtitles,
  styleType,
  duration,
  imageDuration = 3, // Default 3 seconds per image
  audioUrl,
  audioVolume = 1, // Default volume
}) => {
  const { fps } = useVideoConfig();

  // Log props for debugging
  console.log('VideoComposition props:', {
    videoUrls,
    images,
    subtitles,
    styleType,
    duration,
    imageDuration,
    audioUrl,
    audioVolume,
    fps,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Audio */}
      {audioUrl && (
        <Audio
          src={audioUrl}
          volume={audioVolume}
          startFrom={0}
          endAt={Math.ceil(duration * fps)}
          onError={(e) => console.error('Audio load error:', e)}
        />
      )}

      {/* Video mode */}
      {videoUrls && Array.isArray(videoUrls) && videoUrls.length > 0 && (
        <>
          {videoUrls.map((video, index) => (
            <Sequence
              key={index}
              from={Math.floor((video.start || 0) * fps)}
              durationInFrames={Math.floor(((video.end || duration) - (video.start || 0)) * fps)}
            >
              <RemotionVideo
                src={video.src || video}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => console.error(`Remotion Video load error for ${video.src || video}:`, e)}
              />
            </Sequence>
          ))}
          <SubtitleOverlay subtitles={subtitles} styleType={styleType} />
        </>
      )}

      {/* Image slideshow mode */}
      {(!videoUrls || videoUrls.length === 0) && images && images.length > 0 && (
        <>
          {images.map((img, index) => (
            <Sequence
              key={index}
              from={index * imageDuration * fps}
              durationInFrames={imageDuration * fps}
            >
              <Img
                src={img}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Sequence>
          ))}
          <SubtitleOverlay subtitles={subtitles} styleType={styleType} />
        </>
      )}

      {/* Fallback if no videos or images */}
      {(!videoUrls || videoUrls.length === 0) && (!images || images.length === 0) && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#111' }} />
      )}
    </AbsoluteFill>
  );
};

// RemotionComposition component for composition setup
export const RemotionComposition = (props) => {
  const fps = 30; // Define fps before usage
  
  // Log the entire props object to see what's coming in
  console.log('Raw props received:', props);
  
  // Extract duration with fallback for safety
  const rawDuration = props.duration;
  const duration = Number(rawDuration) || 20; // Default to 20 seconds if missing
  
  // Log props for debugging
  console.log('RemotionComposition props before processing:', {
    rawDuration,
    duration,
    durationType: typeof rawDuration,
  });
  
  // Safety check but don't throw error, use fallback
  if (isNaN(duration) || duration <= 0) {
    console.warn('Invalid duration:', rawDuration, 'using default 20 seconds');
  }
  
  const durationInFrames = Math.ceil(duration * fps);
  
  console.log('Final composition settings:', {
    duration,
    durationInFrames,
    fps,
  });

  // Extract all other props
  const {
    videoUrls = [],
    audioUrl = '',
    audioVolume = 1,
    images = [],
    subtitles = [],
    styleType = 'none',
    imageDuration = 3,
  } = props;

  return (
    <Composition
      id="VideoWithSubtitles"
      component={VideoComposition}
      durationInFrames={durationInFrames}
      fps={fps}
      width={606}
      height={1080}
      defaultProps={{
        videoUrls: Array.isArray(videoUrls) ? videoUrls : [],
        images: Array.isArray(images) ? images : [],
        subtitles: Array.isArray(subtitles) ? subtitles : [],
        styleType: styleType || 'none',
        duration: duration,
        imageDuration: Number(imageDuration) || 3,
        audioUrl: audioUrl || '',
        audioVolume: Number(audioVolume) || 1,
      }}
    />
  );
};
