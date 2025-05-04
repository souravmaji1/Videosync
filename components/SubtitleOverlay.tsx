// src/SubtitleOverlay.tsx
import React from 'react';

export const SubtitleOverlay = ({ text, position = 'bottom' }) => {
  const positionStyles = {
    top: { top: '10%', bottom: 'auto' },
    middle: { top: '50%', transform: 'translateY(-50%)' },
    bottom: { bottom: '10%', top: 'auto' }
  };
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: '10%',
    right: '10%',
    textAlign: 'center',
    ...positionStyles[position],
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '8px',
    zIndex: 10
  };
  
  return <div style={style}>{text}</div>;
};