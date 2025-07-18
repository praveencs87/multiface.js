import React, { useState } from 'react';
import { ChatInput, VoiceInput, GUIControls } from '@multiface.js/inputs';
import { AdaptiveModeManager } from '@multiface.js/core';
import { AdaptiveRenderer } from '@multiface.js/outputs';

const modeManager = new AdaptiveModeManager({ initialMode: 'chat' });

export const App: React.FC = () => {
  const [mode, setMode] = useState(modeManager.getMode());
  const [message, setMessage] = useState('Welcome to your Smart Home!');
  const [slider, setSlider] = useState(50);
  const [thermostat, setThermostat] = useState(22);
  const [security, setSecurity] = useState('Armed');

  const handleSend = (msg: string) => {
    setMessage(msg);
    if (msg.toLowerCase().includes('dim')) {
      const match = msg.match(/\d+/);
      if (match) setSlider(Number(match[0]));
    }
    if (msg.toLowerCase().includes('temperature')) {
      const match = msg.match(/\d+/);
      if (match) setThermostat(Number(match[0]));
    }
    if (msg.toLowerCase().includes('arm')) setSecurity('Armed');
    if (msg.toLowerCase().includes('disarm')) setSecurity('Disarmed');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Smart Home Dashboard</h1>
        <div className="flex gap-4 mb-6">
          <button className={`btn ${mode === 'chat' ? 'btn-primary' : ''}`} onClick={() => { modeManager.setMode('chat'); setMode('chat'); }}>Chat</button>
          <button className={`btn ${mode === 'voice' ? 'btn-primary' : ''}`} onClick={() => { modeManager.setMode('voice'); setMode('voice'); }}>Voice</button>
          <button className={`btn ${mode === 'gui' ? 'btn-primary' : ''}`} onClick={() => { modeManager.setMode('gui'); setMode('gui'); }}>GUI</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Lighting</h2>
              {mode === 'gui' && (
                <GUIControls
                  onButtonClick={() => setMessage('Lights toggled!')}
                  onSliderChange={setSlider}
                  sliderValue={slider}
                />
              )}
              <div className="mt-2 text-sm">Brightness: <span className="font-bold">{slider}%</span></div>
            </div>
            <div className="bg-yellow-50 p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Thermostat</h2>
              <input
                type="range"
                min={16}
                max={30}
                value={thermostat}
                onChange={e => setThermostat(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-sm">Temperature: <span className="font-bold">{thermostat}°C</span></div>
            </div>
            <div className="bg-green-50 p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Security</h2>
              <button
                className={`px-3 py-1 rounded ${security === 'Armed' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
                onClick={() => setSecurity('Armed')}
              >
                Arm
              </button>
              <button
                className={`ml-2 px-3 py-1 rounded ${security === 'Disarmed' ? 'bg-red-600 text-white' : 'bg-gray-300'}`}
                onClick={() => setSecurity('Disarmed')}
              >
                Disarm
              </button>
              <div className="mt-2 text-sm">Status: <span className="font-bold">{security}</span></div>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-6">
            <div className="bg-gray-50 p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Assistant</h2>
              {mode === 'chat' && <ChatInput onSend={handleSend} />}
              {mode === 'voice' && <VoiceInput onResult={handleSend} />}
              <div className="mt-4">
                <AdaptiveRenderer
                  mode={mode}
                  message={message}
                  guiComponent={
                    <div>
                      <div>Lights: <span className="font-bold">{slider}%</span></div>
                      <div>Temperature: <span className="font-bold">{thermostat}°C</span></div>
                      <div>Security: <span className="font-bold">{security}</span></div>
                    </div>
                  }
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Activity Log</h2>
              <ul className="text-xs text-gray-600 list-disc ml-4">
                <li>Try: "Dim to 20%" or "Set temperature to 24"</li>
                <li>Try: "Arm security" or "Disarm security"</li>
                <li>Use chat, voice, or GUI to control your home</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 