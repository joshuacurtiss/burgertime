import { LevelOpt, TimerController } from 'kaboom';
import { k, BURGERTIME_BLUE } from '../kaboom';
import { levels } from '../objects/Level';
import { waitSpawnPowerup } from '../objects/Powerup';
import { addEnemy } from '../objects/Enemy';
import { ON_WIN, PeterObj } from '../objects/Peter';
import { addSlice, ON_SLICE_FALL, ON_SLICE_PLATE } from '../objects/Slice';
import { ON_DIE, ON_LIVES_CHANGE } from '../abilities/Alive';
import { DetectableObj } from '../abilities/Detect';
import { ON_SALT_CHANGE } from '../abilities/Salt';
import { ON_SCORE_CHANGE } from '../abilities/Score';

const {
   add,
   addLevel,
   anchor,
   area,
   color,
   debug,
   fixed,
   go,
   isKeyDown,
   onKeyPress,
   on,
   play,
   pos,
   randi,
   Rect,
   rect,
   sprite,
   testRectRect,
   text,
   onUpdate,
   vec2,
   wait,
   z,
} = k;

const CURRENT_PLAYER_TAG = 'current-player';

const levelConf: LevelOpt = {
   tileWidth: 8,
   tileHeight: 8,
   pos: vec2(0, 0),
   tiles: {
      "_": () => [
         sprite('floor', { frame: 0 }),
         "floor",
         "flatfloor",
      ],
      "⌈": () => [
         sprite('stair-blue', { frame: 0 }),
         "stair",
         "stairleft",
      ],
      "⌉": () => [
         sprite('stair-blue', { frame: 1 }),
         "stair",
         "stairright",
      ],
      "⌋": () => [
         sprite('floor-stair-blue', { frame: 0 }),
         "floor",
         "stair",
         "stairleft",
      ],
      "⌊": () => [
         sprite('floor-stair-blue', { frame: 1 }),
         "floor",
         "stair",
         "stairright",
      ],
      "(": () => [
         sprite('plate', { frame: 0 }),
      ],
      ")": () => [
         sprite('plate', { frame: 0, flipX: true }),
      ],
      "⎽": () => [
         sprite('plate', { frame: 1 }),
         "plate",
      ],
   },
};

export interface GameSceneOpt {
   currentPlayer: number;
   players: PeterObj[]
}

const GameSceneOptDefaults: GameSceneOpt = {
   currentPlayer: 0,
   players: [],
};

export default function(options: Partial<GameSceneOpt>) {
   const opt = Object.assign({}, GameSceneOptDefaults, options);
   const player = opt.players[opt.currentPlayer];

   // Music Setup
   const music = play('music', { paused: true, loop: true, volume: 0.6 });

   // UI Setup
   const UI_FONT_SIZE = 10;
   const ui = add([
      fixed(),
   ]);
   ui.add([
      sprite('head-p'),
      pos(184, 8),
   ]);
   ui.add([
      sprite('head-h'),
      pos(216, 8),
   ]);
   ui.add([
      text(`${opt.currentPlayer+1} UP`, { size: UI_FONT_SIZE }),
      pos(16, 8),
   ]);
   ui.add([
      text('HI', { size: UI_FONT_SIZE }),
      pos(112, 8),
   ]);
   const txtScore = ui.add([
      text(player.score.toString(), { size: UI_FONT_SIZE, align: 'right', width: 50 }),
      pos(48, 8),
   ]);
   const txtHiScore = ui.add([
      text('20000', { size: UI_FONT_SIZE, align: 'right', width: 50 }),
      pos(124, 8),
   ]);
   const txtPepper = ui.add([
      text(player.salt.toString(), { size: UI_FONT_SIZE }),
      pos(198, 8),
   ]);
   const txtLives = ui.add([
      text(player.lives.toString(), { size: UI_FONT_SIZE }),
      pos(230, 8),
   ]);
   player.on(ON_LIVES_CHANGE, (qty: number)=>txtLives.text = qty<0 ? '0' : qty.toString());
   player.on(ON_SALT_CHANGE, (qty: number)=>txtPepper.text = qty.toString());
   player.on(ON_SCORE_CHANGE, (score: number)=>{
      txtScore.text = score.toString();
      if (parseInt(txtHiScore.text)<score) txtHiScore.text = score.toString();
   });

   // Level setup
   const levelNumber = player.level<levels.length ? player.level : 0;
   const levelDef = levels[levelNumber];
   const level = addLevel(levelDef.map, levelConf);
   const stairs = level.get('stair') as DetectableObj[];
   const floors = level.get('floor') as DetectableObj[];
   const plates = level.get('plate') as DetectableObj[];

   // Calculate where it is flat floor at top of stairs, which is needed to know
   // when characters can climb down from a flat floor.
   const stairtops = (level.get('flatfloor') as DetectableObj[]).filter(obj=>{
      // See if the tile below this one is a stair. If so, this is a stairtop!
      const stair = stairs.find(stair=>stair.tilePos.eq(obj.tilePos.add(0, 1)));
      if (stair) {
         obj.use('stairtop');
         if (stair.is('stairleft')) obj.use('stairleft');
         else if (stair.is('stairright')) obj.use('stairright');
      }
      return !!stair;
   });

   // Recolor odd columns of stairs
   stairs.filter(stair=>{
      if (stair.is('stairleft') && stair.tilePos.x % 2===0) return true;
      if (stair.is('stairright') && stair.tilePos.x % 2===1) return true;
   }).forEach(stair=>{
      const spriteName = (stair.is('floor') ? 'floor-' : '') + 'stair-green',
            frame = stair.is('stairleft') ? 0 : 1;
      stair.unuse('sprite');
      stair.use(sprite(spriteName, { frame }));
   });

   // Powerups
   waitSpawnPowerup(levelDef.powerup);

   // Enemy Setup
   const enemies = levelDef.enemies.map(opt=>addEnemy(opt));
   enemies.forEach(enemy=>{
      enemy.freeze();
      enemy.setObjects({ floors, stairs, stairtops });
      enemy.target = player;
   });
   const ENEMY_SPEED_CHECK_FREQUENCY = 30;
   const ENEMY_SPEED_INC = 3;
   const enemyInitialSpeed = enemies[0].speed;
   let lastEnemySpeedCheck=0;
   onUpdate(CURRENT_PLAYER_TAG, p=>{
      const levelTime = Math.floor(p.levelTime);
      if (levelTime-lastEnemySpeedCheck>=ENEMY_SPEED_CHECK_FREQUENCY) {
         lastEnemySpeedCheck = levelTime;
         enemies.forEach(enemy=>enemy.speed = enemyInitialSpeed + Math.floor(levelTime/ENEMY_SPEED_CHECK_FREQUENCY*ENEMY_SPEED_INC));
      }
   });

   // Next Scene management (when player dies or wins)
   function goNextScene(action: 'win' | 'die') {
      let { currentPlayer } = opt;
      const { players } = opt,
            deadPlayer = currentPlayer,
            player = players[currentPlayer],
            someoneIsAlive = players.some(p=>p.lives>=0),
            scene = player.isOutOfLives ? 'gameover' : 'game';
      if (action==='die' && someoneIsAlive) {
         do {
            if (++currentPlayer>=players.length) currentPlayer=0;
         } while (someoneIsAlive && players[currentPlayer].isOutOfLives);
      }
      if (scene==='gameover') go(scene, deadPlayer, { ...opt, currentPlayer });
      else go(scene, { ...opt, currentPlayer });
   }

   // Player setup
   opt.players.forEach(p=>{
      p.freeze();
      p.unuse(CURRENT_PLAYER_TAG);
      p.pos = vec2(-20);
   });
   player.use(CURRENT_PLAYER_TAG);
   player.level = levelNumber;
   if (levelDef.player.pos) player.pos = levelDef.player.pos.clone();
   player.setObjects({ floors, stairs, stairtops });
   player.setAnim(vec2(0));
   player.isAlive = true;
   player.isFrozen = true;
   on(ON_DIE, CURRENT_PLAYER_TAG, ()=>{
      enemies.forEach(enemy=>enemy.freeze());
      wait(0.5, ()=>music.stop());
      wait(5, ()=>goNextScene('die'));
   });
   on(ON_WIN, CURRENT_PLAYER_TAG, ()=>{
      music.stop();
      enemies.forEach(enemy=>enemy.freeze());
      wait(5, ()=>goNextScene('win'));
   });

   // Slices
   const slices = levelDef.slices.map(opt=>addSlice(opt));
   slices.forEach((slice, i)=>{
      if (player.slices.length>i) slice.mimic(player.slices[i]);
      slice.setObjects({ floors, plates });
   });
   player.slices = slices;
   on(ON_SLICE_PLATE, 'slice', ()=>{
      if (slices.every(slice=>slice.isOnPlate)) player.win();
   })
   on(ON_SLICE_FALL, 'slice', slice=>{
      slice.enemies = enemies.filter(enemy=>{
         return testRectRect(
            new Rect(slice.pos, slice.getWidth(), slice.getHeight()),
            new Rect(enemy.pos, enemy.width, enemy.height)
         );
      });
   });

   // Controls
   onKeyPress(player.controls.keyboard.action, ()=>player.action());
   onUpdate(CURRENT_PLAYER_TAG, p=>{
      if (p.isFrozen || !p.isAlive) return;
      const { up, down, left, right } = p.controls.keyboard;
      let dir = vec2(0);
      if (isKeyDown(left)) dir = vec2(-1, 0);
      else if (isKeyDown(right)) dir = vec2(1, 0);
      else if (isKeyDown(up)) dir = vec2(0, -1);
      else if (isKeyDown(down)) dir = vec2(0, 1);
      p.setIntendedDir(dir);
   });

   // Cheat Codes
   let keylog = '';
   let keylogTimer: TimerController;
   function debugLog(msg: string) {
      debug.showLog = true;
      debug.log(msg);
   }
   onKeyPress(key=>{
      if (key.length>1) return;
      if (keylogTimer) keylogTimer.cancel();
      keylog += key.toLowerCase();
      keylogTimer=wait(5, ()=>{
         keylog='';
         debug.showLog = debug.inspect;
      });
      if (keylog.slice(-6)==='invuln') {
         player.isInvulnerable = !player.isInvulnerable;
         debugLog(`Invulnerability: ${player.isInvulnerable}`);
      } else if (keylog.slice(-5)==='crazy') {
         player.speed *= 2;
         player.levelTime += ENEMY_SPEED_CHECK_FREQUENCY * 15;
         debugLog(`It's gonna get crazy up in here!`);
      } else if (keylog.slice(-4)==='gold') {
         player.score += randi(75, 150) * 100;
         debugLog(`Score: ${player.score}`);
      } else if (keylog.slice(-4)==='gone') {
         while (enemies.length) enemies.pop()?.destroy();
         debugLog(`Everybody's gone now...`);
      } else if (keylog.slice(-4)==='life') {
         player.lives+=1;
         debugLog(`Lives: ${player.lives}`);
      } else if (keylog.slice(-5)==='music') {
         if (!music.paused) music.stop();
         else music.play();
         debugLog(`Music: ${music.paused ? 'paused' : 'playing'}`)
      } else if (keylog.slice(-4)==='salt' || keylog.slice(-6)==='pepper') {
         player.salt+=1;
         debugLog(`Pepper: ${player.salt}`);
      } else if (keylog.slice(-3)==='win') {
         player.win();
         debugLog('Good job... NOT.');
      }
   });

   // "Player Ready" message and music pause
   const dlgTimer = wait(5, ()=>dlg?.destroy());
   const dlg = add([
      rect(k.width(), k.height()),
      pos(k.width()/2, k.height()/2),
      color(0, 0, 0),
      anchor('center'),
      area(),
      z(9999),
   ]);
   dlg.add([
      text(`Player ${opt.currentPlayer+1} ready!`, { size: 10 }),
      color(BURGERTIME_BLUE),
      anchor('center'),
   ]);
   dlg.onKeyPress(()=>{
      dlgTimer?.cancel();
      dlg.destroy();
   });
   dlg.onDestroy(()=>{
      wait(player.isInitialized ? 0.25 : 3, ()=>{
         player.isFrozen = false;
         enemies.forEach(enemy=>enemy.unfreeze());
         music.play();
      });
      if (!player.isInitialized) {
         play('start');
         player.isInitialized = true;
      }
   });

}
