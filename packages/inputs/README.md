# @multiface.js/inputs

[![npm version](https://img.shields.io/npm/v/@multiface.js/inputs)](https://www.npmjs.com/package/@multiface.js/inputs)
[![GitHub](https://img.shields.io/badge/source-github-blue?logo=github)](https://github.com/praveencs87/multiface.js/tree/main/packages/inputs)

Input components for the Multiface.js SDK.

## Installation

```bash
# With npm
npm install @multiface.js/inputs
# With yarn
yarn add @multiface.js/inputs
# With pnpm
pnpm add @multiface.js/inputs
```

## Peer Dependencies
- React >= 17
- ReactDOM >= 17

## Usage
```tsx
import { ChatInput, VoiceInput, GUIControls } from '@multiface.js/inputs';

function Example() {
  return (
    <div>
      <ChatInput onSend={msg => alert(msg)} />
      <VoiceInput onResult={msg => alert(msg)} />
      <GUIControls onButtonClick={() => alert('Clicked!')} onSliderChange={v => alert(v)} sliderValue={50} />
    </div>
  );
}
``` 