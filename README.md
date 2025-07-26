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

| Package | Description | Platform |
|---|---|---|
| [`@multiface.js/core`](https://www.npmjs.com/package/@multiface.js/core) | Adaptive mode/context manager | Web, Node.js, React Native |
| [`@multiface.js/inputs`](https://www.npmjs.com/package/@multiface.js/inputs) | Chat, Voice, GUI input components | Web, Node.js |
| [`@multiface.js/outputs`](https://www.npmjs.com/package/@multiface.js/outputs) | Adaptive output renderer | Web, Node.js |
| [`@multiface.js/ai`](https://www.npmjs.com/package/@multiface.js/ai) | AI handler (OpenAI, etc.) | Web, Node.js (ESM) |
| [`@multiface.js/utils`](https://www.npmjs.com/package/@multiface.js/utils) | Shared helpers | Web, Node.js |
| [`@multiface.js/fusion`](https://www.npmjs.com/package/@multiface.js/fusion) | Multi-modal input fusion (voice, chat, gestures, touch, etc.) | Web, Node.js, React Native |
| [`@multiface.js/react-native`](https://www.npmjs.com/package/@multiface.js/react-native) | Native mobile components (voice, gesture, camera) | React Native only |
| [`@multiface.js/sensors`](https://www.npmjs.com/package/@multiface.js/sensors) | Device sensor integration (accelerometer, location, etc.) | React Native only |
| [`@multiface.js/context`](https://www.npmjs.com/package/@multiface.js/context) | Context awareness and memory management | Web, Node.js, React Native |

---

## Installation

```bash
# Web/Node.js (Universal packages)
npm install @multiface.js/core @multiface.js/inputs @multiface.js/outputs @multiface.js/fusion @multiface.js/context

# React Native (Mobile-specific packages)
npm install @multiface.js/react-native @multiface.js/sensors
```

> For AI integration, see [`@multiface.js/ai`](./packages/ai) (ESM only)

---

## Quick Usage Examples

### Web/Node.js Example
```tsx
import { ChatInput, VoiceInput, GUIControls } from '@multiface.js/inputs';
import { AdaptiveModeManager } from '@multiface.js/core';
import { AdaptiveRenderer } from '@multiface.js/outputs';
import { InputFusionManager, useFusion } from '@multiface.js/fusion';
import { ContextManager } from '@multiface.js/context';

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

### React Native Example
```tsx
import { RNVoiceInput, RNGestureHandler } from '@multiface.js/react-native';
import { SensorManager, useSensors } from '@multiface.js/sensors';
import { InputFusionManager, useFusion } from '@multiface.js/fusion';
import { ContextManager } from '@multiface.js/context';

function AssistantScreen() {
  // ...fusion and sensor hooks
  return (
    <View>
      <RNVoiceInput onResult={...} />
      <RNGestureHandler onGesture={...} />
      {/* More components */}
    </View>
  );
}
```

---

## Example Apps
- **Web Demo:** See [`examples/smart-home-demo`](./examples/smart-home-demo)
- **React Native Demo:** See [`examples/personal-assistant-rn`](./examples/personal-assistant-rn)

---

## Roadmap & Status
- ✅ Modular packages for web and React Native
- ✅ Multi-modal fusion engine (voice, chat, gesture, touch)
- ✅ Context and memory management
- ✅ Device sensor integration (React Native)
- ✅ Proper Rollup builds and TypeScript support
- ⏳ Personal assistant demo app (React Native)
- ⏳ Comprehensive documentation & API guides
- ⏳ Re-enable advanced features (camera, biometrics, etc.)
- ⏳ Community feedback & iteration

---

## Philosophy
Multiface.js is built on the belief that UI frameworks should support multimodal, adaptive, and AI-powered experiences by default. We aim to make it easy for developers to build interfaces that adapt to users—not the other way around.

---

## License
MIT

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
