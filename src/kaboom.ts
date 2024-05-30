import kaboom, { KaboomCtx } from 'kaboom';

export const k: KaboomCtx = kaboom({
   background: [0, 0, 0],
   width: 256,
   height: 224,
   scale: 3,
});

// Debugging
const params = new URLSearchParams(location.search)
const debugMode = params.has('debug')
k.debug.inspect = debugMode;
k.debug.showLog = debugMode;
