import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Buffer polyfill for browser
if (typeof globalThis.Buffer === 'undefined') {
  class BufferPolyfill extends Uint8Array {
    static from(data: string | Uint8Array, encoding?: string): BufferPolyfill {
      if (typeof data === 'string') {
        return new BufferPolyfill(new TextEncoder().encode(data));
      }
      return new BufferPolyfill(data);
    }
    
    static isBuffer(obj: any): boolean {
      return obj instanceof BufferPolyfill || obj instanceof Uint8Array;
    }
    
    static alloc(size: number): BufferPolyfill {
      return new BufferPolyfill(size);
    }
    
    static concat(list: Uint8Array[], length?: number): BufferPolyfill {
      const totalLength = length || list.reduce((acc, item) => acc + item.length, 0);
      const result = new BufferPolyfill(totalLength);
      let offset = 0;
      for (const item of list) {
        result.set(item, offset);
        offset += item.length;
      }
      return result;
    }
    
    constructor(sizeOrArray: number | Uint8Array) {
      if (typeof sizeOrArray === 'number') {
        super(sizeOrArray);
      } else {
        super(sizeOrArray);
      }
    }
  }
  
  globalThis.Buffer = BufferPolyfill as any;
}

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
