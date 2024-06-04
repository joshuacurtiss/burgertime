import { LevelOpt } from 'kaboom';
import { k, BURGERTIME_BLUE } from '../kaboom';
import { waitSpawnPowerup } from '../objects/Powerup';
import { addEnemy } from '../objects/Enemy';
import { PeterObj } from '../objects/Peter';
import { WalkableObj } from '../abilities/Walk';
import LEVELS from '../levels.json';

const {
   add,
   addLevel,
   anchor,
   area,
   color,
   fixed,
   go,
   isKeyDown,
   onKeyPress,
   pos,
   rect,
   sprite,
   text,
   onUpdate,
   vec2,
   wait,
   z,
} = k;

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
         "plate",
      ],
      ")": () => [
         sprite('plate', { frame: 0, flipX: true }),
         "plate",
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

   // UI Setup
   const ui = add([fixed(), z(100)])

   // Level setup
   const levelNumber = player.level<LEVELS.length ? player.level : 0;
   const level = addLevel(LEVELS[levelNumber], levelConf);
   const stairs = level.get('stair') as WalkableObj[];
   const floors = level.get('floor') as WalkableObj[];

   // Calculate where it is flat floor at top of stairs, which is needed to know
   // when characters can climb down from a flat floor.
   const stairtops = (level.get('flatfloor') as WalkableObj[]).filter(obj=>{
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
   waitSpawnPowerup();

   // Enemy Setup
   addEnemy({ type: 'hotdog', pos: vec2(160, 173) });

   // Next Scene management (when player dies or wins)
   function goNextScene(action: 'win' | 'die') {
      let { currentPlayer } = opt;
      const { players } = opt,
            deadPlayer = currentPlayer,
            player = players[currentPlayer],
            someoneIsAlive = players.some(p=>p.lives>=0),
            scene = player.lives<0 ? 'gameover' : 'game';
      if (action==='die' && someoneIsAlive) {
         do {
            if (++currentPlayer>=players.length) currentPlayer=0;
         } while (someoneIsAlive && players[currentPlayer].lives<0);
      }
      if (scene==='gameover') wait(3, ()=>go(scene, deadPlayer, { ...opt, currentPlayer }));
      else wait(3, ()=>go(scene, { ...opt, currentPlayer }));
   }

   // Player setup
   opt.players.forEach(p=>p.pos = vec2(-20));
   player.level = levelNumber;
   player.pos = vec2(128, 173);
   player.setObjects({ floors, stairs, stairtops });
   player.setAnim(vec2(0));
   player.isAlive = true;
   player.isFrozen = true;
   if (!player.isInitialized) {
      player.onDie(()=>goNextScene('die'));
      player.onWin(()=>goNextScene('win'));
   }

   // Controls
   onKeyPress(player.controls.keyboard.action, ()=>player.action());
   onUpdate('player', p=>{
      if (p.isFrozen || !p.isAlive) return;
      const { up, down, left, right } = p.controls.keyboard;
      let dir = vec2(0);
      if (isKeyDown(left)) dir = vec2(-1, 0);
      else if (isKeyDown(right)) dir = vec2(1, 0);
      else if (isKeyDown(up)) dir = vec2(0, -1);
      else if (isKeyDown(down)) dir = vec2(0, 1);
      p.setIntendedDir(dir);
   });

   // "Player Ready" message and music pause
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
   wait(5, ()=>{
      dlg.destroy();
      wait(player.isInitialized ? 0.5 : 5, ()=>player.isFrozen = false);
      if (!player.isInitialized) {
         // TODO: Play first-time music
         player.isInitialized = true;
      }
   })

}
