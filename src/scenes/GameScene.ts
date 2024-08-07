import { LevelOpt, TimerController } from 'kaboom';
import { k, urlParams, BURGERTIME_BLUE, getVol, isKey, isGamepadButton, DATA_CONTROLS, DATA_HI_SCORE, DATA_MUSIC_VOL, DATA_SFX_VOL, DEFAULT_CONTROLS, DEFAULT_HI_SCORE, DIR } from '../kaboom';
import { levels } from '../objects/Level';
import { addPowerup, waitSpawnPowerup } from '../objects/Powerup';
import { Enemy, ON_SQUASH, addEnemy } from '../objects/Enemy';
import { ON_WIN, isPeter, PeterObj } from '../objects/Peter';
import { addSlice, ON_SLICE_FALL, ON_SLICE_LAND, ON_SLICE_PLATE } from '../objects/Slice';
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
   getData,
   go,
   isKeyDown,
   onKeyPress,
   isGamepadButtonDown,
   onGamepadButtonPress,
   on,
   play,
   pos,
   randi,
   Rect,
   rect,
   setData,
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
      "|": () => [
         sprite('stair-blue', { frame: 0 }),
         "stair",
      ],
      "!": () => [
         sprite('floor-stair-blue', { frame: 0 }),
         "floor",
         "stair",
      ],
      "(": () => [
         sprite('plate', { frame: 0 }),
      ],
      ")": () => [
         sprite('plate', { frame: 0, flipX: true }),
      ],
      "-": () => [
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

   // Check for level edit mode
   const levelEditMode = urlParams.has('lev');
   if (levelEditMode) {
      player.level = parseInt(urlParams.get('lev') ?? '0');
      player.isInitialized = true;
      player.isInvulnerable = true;
   }

   // Music Setup
   const music = play('music', { paused: true, loop: true, volume: getVol(DATA_MUSIC_VOL) });

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
   for (let i=0 ; i<=player.level ; i+=1) {
      ui.add([
         sprite('head-burger'),
         pos(8, 30 + i*10),
      ]);
   }
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
      text(getData(DATA_HI_SCORE, DEFAULT_HI_SCORE).toString(), { size: UI_FONT_SIZE, align: 'right', width: 50 }),
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
      let intHiScore: number = DEFAULT_HI_SCORE;
      try {
         intHiScore = parseInt(txtHiScore.text);
      } catch (exc) {
         console.error('High score could not be parsed as int.');
      }
      if (intHiScore<score) {
         intHiScore = score;
         txtHiScore.text = intHiScore.toString();
         setData(DATA_HI_SCORE, intHiScore);
      }
   });

   // Level setup
   const levelNumber = player.level<levels.length ? player.level : 0;
   const levelDef = levels[levelNumber];
   const level = addLevel(levelDef.map, levelConf);
   const stairs = level.get('stair') as DetectableObj[];
   const floors = level.get('floor') as DetectableObj[];
   const plates = level.get('plate') as DetectableObj[];

   // Assign left/right values of stairs. To simplify the map, we only use one
   // character for the ladder's left/right sides. So, we process these values
   // after the fact and adjust accordingly.
   stairs.forEach(obj=>{
      // See if the tile to the left is a stair.
      const leftStair = stairs.find(stair=>stair.tilePos.eq(obj.tilePos.add(-1, 0)))
      if (leftStair) {
         obj.frame = 1;
         obj.use('stairright');
      } else {
         obj.use('stairleft');
      }
   });

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

   // Powerups (spawn one immediately in level edit mode)
   if (levelEditMode) addPowerup(levelDef.powerup);
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
      // If player has won, freeze enemies continuously in case they reappear
      if (player.isFrozen) enemies.forEach(enemy=>enemy.freeze());
      // Keep track of time on level, and increase enemy speed
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
      const alreadyFalling = new Set<Enemy>();
      slices.forEach(slice=>{
         slice.enemies.forEach(e=>{
            if (!alreadyFalling.has(e)) alreadyFalling.add(e);
         });
      });
      slice.enemies = enemies.filter(enemy=>{
         // If its already falling, don't change anything
         if (alreadyFalling.has(enemy)) return false;
         // If its squashed, don't change anything
         if (enemy.isSquashed) return false;
         // Return whether slice and enemy intersect
         const sliceRect = new Rect(slice.pos.add(1, 2), slice.getWidth()-2, 2),
               enemyRect = new Rect(enemy.pos.add(-enemy.width/2, enemy.height/4), enemy.width, enemy.height/4);
         return testRectRect(sliceRect, enemyRect);
      });
   });

   // Controls
   const controls = getData(DATA_CONTROLS, DEFAULT_CONTROLS);
   player.controls = controls[opt.currentPlayer];
   if (isGamepadButton(player.controls.action)) onGamepadButtonPress(player.controls.action, ()=>player.action());
   else if (isKey(player.controls.action)) onKeyPress(player.controls.action, ()=>player.action());
   if (isGamepadButton(player.controls.pause)) onGamepadButtonPress(player.controls.pause, ()=>debug.paused=!debug.paused);
   else if (isKey(player.controls.pause)) onKeyPress(player.controls.pause, ()=>debug.paused=!debug.paused);
   const dirPriority = ['left', 'right', 'up', 'down'];
   onUpdate(CURRENT_PLAYER_TAG, p=>{
      if (p.isFrozen || !p.isAlive) return;
      if (!isPeter(p)) return;
      let dir = vec2(0);
      dirPriority.some(d=>{
         const k = p.controls[d];
         if (isKey(k) && isKeyDown(k) || isGamepadButton(k) && isGamepadButtonDown(k)) dir = DIR[d];
         return !dir.isZero();
      });
      p.setIntendedDir(dir);
   });

   // Scoring
   on(ON_SQUASH, 'enemy', ()=>{
      player.score += 100;
   });
   on(ON_SLICE_LAND, 'slice', slice=>{
      player.score += 50;
      player.score += slice.enemies.length * 100;
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
      } else if (keylog.slice(-4)==='kill') {
         enemies.forEach(enemy=>enemy.squash());
         debugLog(`Everybody died...`);
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
   const dlgTimer = wait(levelEditMode ? 0 : 5, ()=>dlg?.destroy());
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
         // Don't activate enemies/music in level edit mode
         if (levelEditMode) return;
         enemies.forEach(enemy=>enemy.unfreeze());
         music.play();
      });
      if (!player.isInitialized) {
         play('start', { volume: getVol(DATA_SFX_VOL) });
         player.isInitialized = true;
      }
   });

}
