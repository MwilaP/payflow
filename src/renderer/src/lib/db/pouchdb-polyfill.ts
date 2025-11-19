// PouchDB polyfill for Vite environment
// This ensures PouchDB works correctly in the browser with Vite

// Polyfill for global object
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

// Polyfill for process object
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    version: '16.0.0',
    browser: true
  };
}

// Polyfill for Buffer if needed
if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {
    isBuffer: () => false,
    from: (data: any) => new Uint8Array(data),
    alloc: (size: number) => new Uint8Array(size)
  };
}

export {};
