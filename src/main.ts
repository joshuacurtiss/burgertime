import kaboom, {
   KaboomCtx,
   LevelOpt,
} from "kaboom";

const k: KaboomCtx = kaboom({
   background: [0, 0, 0],
   width: 256,
   height: 224,
   scale: 3,
});

const {
   loadAseprite,
   loadRoot,
   loadSprite,
   isKeyDown,
   onKeyDown,
   onKeyPress,
   onKeyRelease,
   add,
   addLevel,
   anchor,
   area,
   body,
   camPos,
   color,
   debug,
   destroy,
   fixed,
   go,
   height,
   lifespan,
   offscreen,
   pos,
   Rect,
   scene,
   setGravity,
   sprite,
   text,
   time,
   toScreen,
   wait,
   vec2,
   z,
} = k;

const LEVELS = [
   [
      "                                ",
      "                                ",
      "                                ",
      "                                ",
      "   __________________________   ",
      "   ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉   ",
      "   ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉   ",
      "   ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉   ",
      "   ⌋⌊____⌋⌊ ⌈⌉ ⌋⌊____⌋⌊____⌋⌊   ",
      "      ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉   ",
      "      ⌈⌉ ⌋⌊_⌋⌊_⌋⌊ ⌈⌉ ⌈⌉    ⌈⌉   ",
      "      ⌈⌉ ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉   ",
      "   ___⌋⌊_⌋⌊    ⌈⌉ ⌈⌉ ⌋⌊____⌋⌊   ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉      ",
      "   ⌈⌉ ⌈⌉ ⌋⌊____⌋⌊_⌋⌊_⌋⌊ ⌈⌉      ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉      ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌋⌊_⌋⌊___   ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌋⌊_⌋⌊_⌋⌊____⌋⌊____⌋⌊ ⌈⌉ ⌈⌉   ",
      "   ⌈⌉    ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌈⌉    ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌈⌉    ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌋⌊____⌋⌊____⌋⌊____⌋⌊_⌋⌊_⌋⌊   ",
      "                                ",
      "                                ",
      "                                ",
      "    ⌞⎽⎽⎽⎽⌟⌞⎽⎽⎽⎽⌟⌞⎽⎽⎽⎽⌟⌞⎽⎽⎽⎽⌟    ",
   ],
];

loadRoot("sprites/");
// Multiple frames
loadSprite("burger", "burger.png", { sliceX: 28 });
loadSprite("enemies", "enemies.png", {
   sliceX: 12,
   sliceY: 3,
   anims: {
      'hotdog-walk': { from: 1, to: 2, loop: true, speed: 8 },
      'hotdog-down': { from: 3, to: 4, loop: true, speed: 8 },
      'hotdog-up': { from: 5, to: 6, loop: true, speed: 8 },
      'hotdog-squash': { from: 7, to: 10, speed: 12 },
      'hotdog-stun': { from: 11, to: 12, loop: true, speed: 1 },
      'pickle-walk': { from: 13, to: 14, loop: true, speed: 8 },
      'pickle-down': { from: 15, to: 16, loop: true, speed: 8 },
      'pickle-up': { from: 17, to: 18, loop: true, speed: 8 },
      'pickle-squash': { from: 19, to: 22, speed: 12 },
      'pickle-stun': { from: 23, to: 24, loop: true, speed: 1 },
      'egg-walk': { from: 25, to: 26, loop: true, speed: 8 },
      'egg-down': { from: 27, to: 28, loop: true, speed: 8 },
      'egg-up': { from: 29, to: 30, loop: true, speed: 8 },
      'egg-squash': { from: 31, to: 34, speed: 12 },
      'egg-stun': { from: 35, to: 36, loop: true, speed: 1 },
   },
});
loadSprite("peter", "peter.png", {
   sliceX: 19,
   anims: {
      walk: { from: 1, to: 3, loop: true, speed: 9 },
      down: { from: 4, to: 5, loop: true, speed: 9 },
      up: { from: 6, to: 7, loop: true, speed: 9 },
      fall: { from: 15, to: 19, speed: 10 },
      dead: { from: 18, to: 19, loop: true, speed: 8 }
   },
});
// Single frame
loadSprite("floor", "floor.png", { sliceX: 2 });
loadSprite("floor-stair-blue", "floor-stair-blue.png", { sliceX: 2 });
loadSprite("floor-stair-green", "floor-stair-green.png", { sliceX: 2 });
loadSprite("head-h", "head-h.png");
loadSprite("head-p", "head-p.png");
loadSprite("plate", "plate.png", { sliceX: 2 });
loadSprite("salt", "salt.png", { sliceX: 4 });
loadSprite("stair-blue", "stair-blue.png", { sliceX: 2 });
loadSprite("stair-green", "stair-green.png", { sliceX: 2 });

const levelConf: LevelOpt = {
   // grid size
   tileWidth: 8,
   tileHeight: 8,
   pos: vec2(0, 0),
   tiles: {
      "_": () => [sprite('floor', { frame: 0 })],
      "⌈": () => [sprite('stair-blue', { frame: 0 })],
      "⌉": () => [sprite('stair-blue', { frame: 1 })],
      "⌋": () => [sprite('floor-stair-blue', { frame: 0 })],
      "⌊": () => [sprite('floor-stair-blue', { frame: 1 })],
      "⌞": () => [sprite('plate', { frame: 0 })],
      "⌟": () => [sprite('plate', { frame: 0, flipX: true })],
      "⎽": () => [sprite('plate', { frame: 1 })],
   }
};

debug.inspect = !!location.search.match(/\bdebug\b/);

scene("start", () => {
   add([
      text("Press enter to start", { size: 18 }),
      pos(vec2(160, 120)),
      anchor("center"),
      color(255, 255, 255),
   ]);

   onKeyRelease("enter", ()=>go("game"));
   onKeyRelease("space", ()=>go("game"));
});

scene("game", (levelNumber = 0) => {
   // Layers
   const ui = add([fixed(), z(100)]),
         bg = add([z(-1)]);

   const level = addLevel(LEVELS[levelNumber], levelConf);

});

go("game");
