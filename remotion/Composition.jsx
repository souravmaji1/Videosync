import { AbsoluteFill, useVideoConfig, Video as RemotionVideo, Img, Sequence, Audio } from 'remotion';
import SubtitleOverlay from '../components/SubtitleOverlay';
import { Composition } from 'remotion';

export const VideoComposition = ({
  videoUrls,
  images,
  subtitles,
  styleType,
  duration,
  imageDuration = 3, // Default 3 seconds per image
  audioUrl,
  audioVolume = 1 // Default volume
}) => {
  const { fps } = useVideoConfig();
  const frameRate = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Audio */}
      {audioUrl && (
        <Audio
          src={audioUrl}
          volume={audioVolume}
          startFrom={0}
          endAt={Math.ceil(duration * frameRate)}
          onError={(e) => console.error('Audio load error:', e)}
        />
      )}

      {/* Video mode */}
      {videoUrls && Array.isArray(videoUrls) && (
        <>
          {videoUrls.map((video, index) => (
            <Sequence
              key={index}
              from={Math.floor(video.start * frameRate)}
              durationInFrames={Math.floor((video.end - video.start) * frameRate)}
            >
              <RemotionVideo
                src={video.src}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => console.error(`Remotion Video load error for ${video.src}:`, e)}
              />
            </Sequence>
          ))}
          <SubtitleOverlay subtitles={subtitles} styleType={styleType} />
        </>
      )}

      {/* Image slideshow mode */}
      {images && images.length > 0 && (
        <>
          {images.map((img, index) => (
            <Sequence
              key={index}
              from={index * imageDuration * frameRate}
              durationInFrames={imageDuration * frameRate}
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
    </AbsoluteFill>
  );
};

export const RemotionComposition = () => {
  const fps = 30;
  const defaultDuration = 30; // Fallback duration in seconds

  return (
    <>
      <Composition
        id="VideoWithSubtitles"
        component={VideoComposition}
        durationInFrames={(props) => Math.ceil((props.duration || defaultDuration) * fps)} // Dynamic duration based on prop
        fps={fps}
        width={606}
        height={1080}
        defaultProps={{
          videoUrls: [],
          images: [],
          subtitles: [],
          styleType: 'none',
          duration: defaultDuration,
          imageDuration: 3,
          audioUrl: '',
          audioVolume: 1
        }}
      />
    </>
  );
};


