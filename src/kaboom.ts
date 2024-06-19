import kaboom, { KaboomCtx } from 'kaboom';

// Game Constants
export const GAME_WIDTH = 256;
export const GAME_HEIGHT = 224;
export const DEFAULT_VOL = '50';
export const DATA_MUSIC_VOL = 'bt_music_vol';
export const DATA_SFX_VOL = 'bt_sfx_vol';

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

// Sound Handling
export function getVol(which: string): number {
   return parseInt(k.getData(which, DEFAULT_VOL)) / 100
}

// Debugging
export const urlParams = new URLSearchParams(location.search)
const debugMode = urlParams.has('debug')
k.debug.inspect = debugMode;
k.debug.showLog = debugMode;
