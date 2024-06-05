import { k } from './kaboom';
import GameOverScene from './scenes/GameOverScene';
import GameScene from './scenes/GameScene';
import StartScene from './scenes/StartScene';

const {
   loadRoot,
   loadSound,
   loadSprite,
   go,
   scene,
} = k;

loadRoot("sfx/");
loadSound("burger_drop", "burger_drop.ogg");
loadSound("burger_floor", "burger_floor.ogg");
loadSound("burger_step", "burger_step.ogg");
loadSound("die", "die.ogg");
loadSound("enemy_fall", "enemy_fall.ogg");
loadSound("enemy_squash", "enemy_squash.ogg");
loadSound("item", "item.ogg");
loadSound("music", "music.ogg");
loadSound("pepper", "pepper.ogg");
loadSound("powerup", "powerup.ogg");
loadSound("start", "start.ogg");
loadSound("win", "win.ogg");
loadRoot("sprites/");
loadSprite("burger", "burger.png", { sliceX: 28 });
loadSprite("enemies", "enemies.png", {
   sliceX: 12,
   sliceY: 3,
   anims: {
      'hotdog-walk': { from: 0, to: 1, loop: true, speed: 8 },
      'hotdog-down': { from: 2, to: 3, loop: true, speed: 8 },
      'hotdog-up': { from: 4, to: 5, loop: true, speed: 8 },
      'hotdog-squash': { from: 6, to: 9, speed: 12 },
      'hotdog-stun': { from: 10, to: 11, loop: true, speed: 1 },
      'pickle-walk': { from: 12, to: 13, loop: true, speed: 8 },
      'pickle-down': { from: 14, to: 15, loop: true, speed: 8 },
      'pickle-up': { from: 16, to: 17, loop: true, speed: 8 },
      'pickle-squash': { from: 18, to: 21, speed: 12 },
      'pickle-stun': { from: 22, to: 23, loop: true, speed: 1 },
      'egg-walk': { from: 24, to: 25, loop: true, speed: 8 },
      'egg-down': { from: 26, to: 27, loop: true, speed: 8 },
      'egg-up': { from: 28, to: 29, loop: true, speed: 8 },
      'egg-squash': { from: 30, to: 33, speed: 12 },
      'egg-stun': { from: 34, to: 35, loop: true, speed: 1 },
   },
});
loadSprite("peter", "peter.png", {
   sliceX: 19,
   anims: {
      idle: { from: 7, to: 7, loop: true, speed: 1 },
      walk: { from: 0, to: 2, loop: true, speed: 24 },
      down: { from: 3, to: 4, loop: true, speed: 12 },
      up: { from: 5, to: 6, loop: true, speed: 12 },
      'throw': { from: 9, to: 9, speed: 1 },
      'throw-down': { from: 10, to: 10, speed: 1 },
      'throw-up': { from: 11, to: 11, speed: 1 },
      celebrate: { from: 13, to: 13, speed: 1 },
      fall: { from: 14, to: 18, speed: 10 },
      dead: { from: 17, to: 18, loop: true, speed: 8 }
   },
});
loadSprite("title", "title.png");
loadSprite("floor", "floor.png", { sliceX: 2 });
loadSprite("floor-stair-blue", "floor-stair-blue.png", { sliceX: 2 });
loadSprite("floor-stair-green", "floor-stair-green.png", { sliceX: 2 });
loadSprite("head-h", "head-h.png");
loadSprite("head-p", "head-p.png");
loadSprite("plate", "plate.png", { sliceX: 2 });
loadSprite("powerups", "powerups.png", { sliceX: 3 });
loadSprite("salt", "salt.png", { sliceX: 4 });
loadSprite("stair-blue", "stair-blue.png", { sliceX: 2 });
loadSprite("stair-green", "stair-green.png", { sliceX: 2 });

scene("start", StartScene);
scene("game", GameScene);
scene("gameover", GameOverScene);
go("start");
