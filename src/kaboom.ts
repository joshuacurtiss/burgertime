import kaboom, { GamepadButton, KaboomCtx, Key } from 'kaboom';
import { PeterControls } from './objects/Peter';

// Game Constants
export const GAME_WIDTH = 256;
export const GAME_HEIGHT = 224;
export const DEFAULT_VOL: number = 50;
export const DEFAULT_HI_SCORE: number = 20000;
export const DEFAULT_CONTROLS: PeterControls[] = [
   {
      action: 'space',
      pause: 'escape',
      left: 'left',
      right: 'right',
      up: 'up',
      down: 'down',
   },
   {
      action: 'meta',
      pause: 'escape',
      left: 'a',
      right: 'd',
      up: 'w',
      down: 's',
   },
   {
      action: 'shift',
      pause: 'escape',
      left: 'j',
      right: 'l',
      up: 'i',
      down: 'k',
   },
   {
      action: 'south',
      pause: 'start',
      left: 'dpad-left',
      right: 'dpad-right',
      up: 'dpad-up',
      down: 'dpad-down',
   },
];
export const DATA_MUSIC_VOL = 'bt_music_vol';
export const DATA_SFX_VOL = 'bt_sfx_vol';
export const DATA_CONTROLS = 'bt_controls';
export const DATA_HI_SCORE = 'bt_hi_score';

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

// Game Defaults
k.getData(DATA_MUSIC_VOL, DEFAULT_VOL);
k.getData(DATA_SFX_VOL, DEFAULT_VOL);
k.getData(DATA_CONTROLS, DEFAULT_CONTROLS);
k.getData(DATA_HI_SCORE, DEFAULT_HI_SCORE);

// Game Constants (using Kaboom context)
export const BURGERTIME_BLUE = k.rgb(0, 149, 255);
export const DIR = {
   'left': k.LEFT,
   'right': k.RIGHT,
   'up': k.UP,
   'down': k.DOWN,
}

// Sound Handling
export function getVol(which: string): number {
   return k.getData(which, DEFAULT_VOL) / 100;
}

// Type Guards
export function isGamepadButton(key: string): key is GamepadButton {
   return [
      "north", "east", "south", "west", "ltrigger", "rtrigger", "lshoulder", "rshoulder", "select",
      "start", "lstick", "rstick", "dpad-up", "dpad-right", "dpad-down", "dpad-left", "home", "capture",
   ].includes(key);
}
export function isKey(key: string): key is Key {
   return [
      "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12",
      "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=",
      "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\",
      "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'",
      "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
      "escape", "backspace", "enter", "tab", "control", "alt", "meta", "space", " ",
      "left", "right", "up", "down", "shift",
   ].includes(key);
}

// Debugging
export const urlParams = new URLSearchParams(location.search)
const debugMode = urlParams.has('debug')
k.debug.inspect = debugMode;
k.debug.showLog = debugMode;
