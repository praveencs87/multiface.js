import React from 'react';

export interface GUIControlsProps {
  onButtonClick: () => void;
  onSliderChange: (value: number) => void;
  sliderValue: number;
}

export const GUIControls: React.FC<GUIControlsProps> = ({ onButtonClick, onSliderChange, sliderValue }) => {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <button onClick={onButtonClick}>Action</button>
      <input
        type="range"
        min={0}
        max={100}
        value={sliderValue}
        onChange={e => onSliderChange(Number(e.target.value))}
      />
      <span>{sliderValue}</span>
    </div>
  );
}; 