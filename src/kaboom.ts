import kaboom, { KaboomCtx } from 'kaboom';

// Game Constants
export const GAME_WIDTH = 256;
export const GAME_HEIGHT = 224;

// Kaboom Instance
export const k: KaboomCtx = kaboom({
   background: [0, 0, 0],
   crisp: true,
   stretch: true,
   letterbox: true,
   scale: 8,
   width: GAME_WIDTH,
   height: GAME_HEIGHT,
});
k.setFullscreen(true);

// Game Constants (using Kaboom context)
export const BURGERTIME_BLUE = k.rgb(0, 149, 255);

// Debugging
const params = new URLSearchParams(location.search)
const debugMode = params.has('debug')
k.debug.inspect = debugMode;
k.debug.showLog = debugMode;
