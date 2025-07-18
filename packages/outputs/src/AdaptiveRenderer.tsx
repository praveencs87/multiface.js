import React from 'react';

export type OutputMode = 'chat' | 'voice' | 'gui';

export interface AdaptiveRendererProps {
  mode: OutputMode;
  message: string;
  guiComponent?: React.ReactNode;
}

export const AdaptiveRenderer: React.FC<AdaptiveRendererProps> = ({ mode, message, guiComponent }) => {
  React.useEffect(() => {
    if (mode === 'voice' && 'speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utter);
    }
  }, [mode, message]);

  if (mode === 'chat') {
    return <div style={{ padding: 8, background: '#f3f3f3', borderRadius: 4 }}>{message}</div>;
  }
  if (mode === 'voice') {
    return <div style={{ fontStyle: 'italic', color: '#888' }}>🔊 {message}</div>;
  }
  if (mode === 'gui' && guiComponent) {
    return <div>{guiComponent}</div>;
  }
  return null;
}; 