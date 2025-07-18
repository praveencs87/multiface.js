import React, { useState } from 'react';

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, placeholder }) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        type="text"
        value={value}
        placeholder={placeholder || 'Type a message...'}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSend();
        }}
        style={{ flex: 1 }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}; 