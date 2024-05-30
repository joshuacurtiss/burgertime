import { k } from './kaboom';
import GameScene from './scenes/GameScene';
import StartScene from './scenes/StartScene';

const {
   loadRoot,
   loadSprite,
   go,
   scene,
} = k;

loadRoot("sprites/");
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
      idle: { from: 7, to: 7, loop: true, speed: 1 },
      walk: { from: 0, to: 2, loop: true, speed: 24 },
      down: { from: 3, to: 4, loop: true, speed: 24 },
      up: { from: 5, to: 6, loop: true, speed: 24 },
      'throw': { from: 9, to: 9, speed: 2 },
      'throw-down': { from: 10, to: 10, speed: 2 },
      'throw-up': { from: 11, to: 11, speed: 2 },
      celebrate: { from: 13, to: 13, speed: 1 },
      fall: { from: 14, to: 18, speed: 20 },
      dead: { from: 17, to: 18, loop: true, speed: 10 }
   },
});
loadSprite("floor", "floor.png", { sliceX: 2 });
loadSprite("floor-stair-blue", "floor-stair-blue.png", { sliceX: 2 });
loadSprite("floor-stair-green", "floor-stair-green.png", { sliceX: 2 });
loadSprite("head-h", "head-h.png");
loadSprite("head-p", "head-p.png");
loadSprite("plate", "plate.png", { sliceX: 2 });
loadSprite("salt", "salt.png", { sliceX: 4 });
loadSprite("stair-blue", "stair-blue.png", { sliceX: 2 });
loadSprite("stair-green", "stair-green.png", { sliceX: 2 });

scene("start", StartScene);
scene("game", GameScene);
go("game");
