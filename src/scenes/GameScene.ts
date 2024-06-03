import { LevelOpt } from 'kaboom';
import { k } from '../kaboom';
import { waitSpawnPowerup } from '../objects/Powerup';
import { addEnemy } from '../objects/Enemy';
import { addPeter } from '../objects/Peter';
import { WalkableObj } from '../abilities/Walk';
import LEVELS from '../levels.json';

const {
   add,
   addLevel,
   fixed,
   sprite,
   vec2,
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
   addPeter({ pos: vec2(128, 173), walkableObjects: { floors, stairs, stairtops }});

   // Enemy Setup
   addEnemy({ type: 'hotdog', pos: vec2(160, 173) });

   // Powerups
   waitSpawnPowerup();
}
