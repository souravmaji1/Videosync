import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

const SubtitleOverlay = ({ subtitles, position = 'bottom' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  console.log('SubtitleOverlay props:', {
    subtitles,
    position,
    frame,
    fps,
  });

  const activeSubtitle = subtitles.find(subtitle => {
    const startFrame = Math.floor(subtitle.start * fps);
    const endFrame = Math.floor(subtitle.end * fps);
    console.log('Checking subtitle:', {
      text: subtitle.text,
      startFrame,
      endFrame,
      currentFrame: frame,
    });
    return frame >= startFrame && frame <= endFrame;
  });

  console.log('Active subtitle:', activeSubtitle);

  const positionStyles = {
    top: { top: '10%', bottom: 'auto', transform: 'none' },
    middle: { top: '50%', bottom: 'auto', transform: 'translateY(-50%)' },
    bottom: { bottom: '10%', top: 'auto', transform: 'none' }
  };

  const style = {
    position: 'absolute',
    left: '10%',
    right: '10%',
    ...positionStyles[position],
    textAlign: 'center',
    fontFamily: 'Liberation Sans, Arial, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '8px',
    zIndex: 10,
    opacity: activeSubtitle ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out'
  };

  return <div style={style}>{activeSubtitle ? activeSubtitle.text : ''}</div>;
};

export default SubtitleOverlay;