// src/remotion/Composition.jsx

import React from 'react';
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

  // Ensure duration is a number with a minimum of 1
  const safeDuration = Math.max(1, Number(duration) || 6);

  // Log props for debugging
  console.log('VideoComposition props:', {
    videoUrls,
    images,
    subtitles,
    styleType,
    duration: safeDuration,
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
export const RemotionComposition = (props) => {
  const fps = 30; // Define fps before usage
  
  // Log the entire props object to see what's coming in
  console.log('Raw props received:', props);
  
  // Precise duration handling
  const rawDuration = props.duration || props.audioUrl ? 
    (Number(props.duration) || 
     (props.audioUrl && Number(props.audioUrl.split('_').pop().split('.')[0]) / 1000) || 
     6) : 
    6;
  
  // Round to nearest whole number, minimum 1 second
  const duration = Math.max(1, Math.round(rawDuration));
  
  // Log props for debugging
  console.log('RemotionComposition props processing:', {
    rawDuration,
    processedDuration: duration,
    durationType: typeof rawDuration,
  });
  
  const durationInFrames = Math.ceil(duration * fps);
  
  console.log('Final composition settings:', {
    duration,
    durationInFrames,
    fps,
  });

  // Extract all other props with robust defaults
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
