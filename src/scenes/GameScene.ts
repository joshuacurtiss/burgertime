import {
   GameObj,
   LevelOpt,
   PosComp,
   SpriteComp,
} from 'kaboom';
import { k } from '../kaboom';
import { powerup } from '../com/Powerup';
import { peter, PeterComp } from '../com/Peter';
import { canSalt, SaltComp } from '../com/Salt';
import { canWalk, WalkComp, WalkableObj } from '../com/Walk';
import LEVELS from '../levels.json';

const {
   add,
   addLevel,
   anchor,
   area,
   fixed,
   rand,
   Rect,
   sprite,
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
      p: () => [
         sprite("peter", { anim: 'idle' }),
         area({ shape: new Rect(vec2(0), 8, 15) }),
         anchor('center'),
         peter(),
         canSalt(),
         canWalk(),
         z(10),
         "player",
      ],
      '$': () => [
         powerup(),
         z(5),
      ],
   },
};

export default function(levelNumber = 0) {
   // UI Setup
   const ui = add([fixed(), z(100)])

   // Level setup
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

   // Player setup
   const player: GameObj<PeterComp & PosComp & SpriteComp & SaltComp & WalkComp> = level.spawn("p", 16, 21.625);
   player.setObjects({ floors, stairs, stairtops });

   // Powerups
   function waitSpawnPowerup() {
      // Wait 20-60 seconds
      wait(rand()*40+20, ()=>{
         level.spawn('$', 16, 13.5).onDestroy(waitSpawnPowerup)
      });
   }
   waitSpawnPowerup();
}
