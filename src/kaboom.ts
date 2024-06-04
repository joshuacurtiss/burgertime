import kaboom, { KaboomCtx } from 'kaboom';

export const k: KaboomCtx = kaboom({
   background: [0, 0, 0],
   width: 256,
   height: 224,
   scale: 3,
});

export const BURGERTIME_BLUE = k.rgb(0, 149, 255);

// Debugging
const params = new URLSearchParams(location.search)
const debugMode = params.has('debug')
k.debug.inspect = debugMode;
k.debug.showLog = debugMode;
