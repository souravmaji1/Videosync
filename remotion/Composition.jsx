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

  // Validate duration
  const safeDuration = Number(duration) || 30; // Fallback to 30 seconds

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Audio */}
      {audioUrl && (
        <Audio
          src={audioUrl}
          volume={audioVolume}
          startFrom={0}
          endAt={Math.ceil(safeDuration * fps)}
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
              durationInFrames={Math.floor(((video.end || safeDuration) - (video.start || 0)) * fps)}
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
export const RemotionComposition = ({
  videoUrls,
  audioUrl,
  audioVolume,
  images,
  subtitles,
  styleType,
  duration,
  imageDuration,
}) => {
  const fps = 30; // Define fps before usage
  const safeDuration = Number(duration) || 30; // Fallback to 30 seconds
  const durationInFrames = Math.ceil(safeDuration * fps);

  // Log props for debugging
  console.log('RemotionComposition props:', {
    videoUrls,
    audioUrl,
    audioVolume,
    images,
    subtitles,
    styleType,
    duration,
    safeDuration,
    durationInFrames,
    durationType: typeof duration,
  });

  // Validate durationInFrames
  if (isNaN(durationInFrames) || durationInFrames <= 0) {
    console.error('Invalid durationInFrames:', durationInFrames);
    throw new Error('Duration must be a positive number');
  }

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
        duration: safeDuration,
        imageDuration: Number(imageDuration) || 3,
        audioUrl: audioUrl || '',
        audioVolume: Number(audioVolume) || 1,
      }}
    />
  );
};

