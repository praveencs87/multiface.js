# multiface.js

[![npm version](https://img.shields.io/npm/v/@multiface.js/inputs?label=@multiface.js/inputs)](https://www.npmjs.com/package/@multiface.js/inputs)
[![npm version](https://img.shields.io/npm/v/@multiface.js/core?label=@multiface.js/core)](https://www.npmjs.com/package/@multiface.js/core)
[![npm version](https://img.shields.io/npm/v/@multiface.js/outputs?label=@multiface.js/outputs)](https://www.npmjs.com/package/@multiface.js/outputs)
[![npm version](https://img.shields.io/npm/v/@multiface.js/ai?label=@multiface.js/ai)](https://www.npmjs.com/package/@multiface.js/ai)
[![npm version](https://img.shields.io/npm/v/@multiface.js/utils?label=@multiface.js/utils)](https://www.npmjs.com/package/@multiface.js/utils)

**Adaptive Multimodal UI SDK**

Build next-generation UIs that combine chat, GUI, and voice, with AI integration and seamless context switching. Works across web and mobile apps.

> **GitHub:** [praveencs87/multiface.js](https://github.com/praveencs87/multiface.js)

---

## Features
- 🗨️ Chat, 🎤 Voice, and 🖱️ GUI input components
- Adaptive interface switching (Orchestration Engine)
- AI integration (OpenAI, multimodal, etc.)
- Output as chat, voice, or dynamic UI
- Plugin-friendly, extensible, and open source
- **Works with any UI framework:** Tailwind CSS, Bootstrap, shadcn/ui, Ant Design, Material UI, Chakra UI, and more!

---

## UI Framework Compatibility

multiface.js SDK components are plain React components. You can use them with any UI framework or styling solution, including:
- **Tailwind CSS**
- **Bootstrap**
- **shadcn/ui**
- **Ant Design (Antd)**
- **Material UI**
- **Chakra UI**
- ...and more!

**Example: Using multiface.js with Tailwind and Ant Design**

```tsx
import { Button, Card } from 'antd';
import { ChatInput } from '@multiface.js/inputs';

function MyDashboard() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Card title="Chat" className="mb-4">
        <ChatInput onSend={msg => alert(msg)} />
      </Card>
      <Button type="primary">Antd Button</Button>
      <div className="mt-4 p-4 bg-blue-100 rounded">Styled with Tailwind</div>
    </div>
  );
}
```

---

## Packages

- [`@multiface.js/inputs`](https://www.npmjs.com/package/@multiface.js/inputs) ([source](https://github.com/praveencs87/multiface.js/tree/main/packages/inputs)) — Chat, Voice, GUI input components
- [`@multiface.js/core`](https://www.npmjs.com/package/@multiface.js/core) ([source](https://github.com/praveencs87/multiface.js/tree/main/packages/core)) — Orchestration engine (mode/context switching)
- [`@multiface.js/outputs`](https://www.npmjs.com/package/@multiface.js/outputs) ([source](https://github.com/praveencs87/multiface.js/tree/main/packages/outputs)) — Adaptive output renderer
- [`@multiface.js/ai`](https://www.npmjs.com/package/@multiface.js/ai) ([source](https://github.com/praveencs87/multiface.js/tree/main/packages/ai)) — AI handler (ESM only)
- [`@multiface.js/utils`](https://www.npmjs.com/package/@multiface.js/utils) ([source](https://github.com/praveencs87/multiface.js/tree/main/packages/utils)) — Shared helpers

---

## Installation (Example)

```bash
# With npm
npm install @multiface.js/inputs @multiface.js/core @multiface.js/outputs
# With yarn
yarn add @multiface.js/inputs @multiface.js/core @multiface.js/outputs
# With pnpm
pnpm add @multiface.js/inputs @multiface.js/core @multiface.js/outputs
```

> For AI integration, see [`@multiface.js/ai`](./packages/ai) (ESM only)

---

## Quick Usage Example

```tsx
import { ChatInput, VoiceInput, GUIControls } from '@multiface.js/inputs';
import { AdaptiveModeManager } from '@multiface.js/core';
import { AdaptiveRenderer } from '@multiface.js/outputs';

const modeManager = new AdaptiveModeManager({ initialMode: 'chat' });

function App() {
  // ...state and handlers
  return (
    <div>
      <ChatInput onSend={...} />
      <VoiceInput onResult={...} />
      <GUIControls ... />
      <AdaptiveRenderer mode={...} message={...} guiComponent={...} />
    </div>
  );
}
```

---

## Example App
See [`examples/smart-home-demo`](./examples/smart-home-demo) for a full working demo.

---

## License
MIT
