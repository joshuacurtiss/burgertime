import { k, getVol, DATA_SFX_VOL } from '../kaboom';
import {
   AnchorComp,
   AreaComp,
   Comp,
   GameObj,
   PosComp,
   SpriteComp,
   Vec2,
   ZComp
} from 'kaboom';

const {
   add,
   anchor,
   area,
   color,
   lifespan,
   play,
   pos,
   randi,
   sprite,
   text,
   vec2,
   wait,
   z,
} = k;

export type PowerupType = 0 | 1 | 2;

export interface PowerupComp extends Comp {
   timeout: number;
   type: PowerupType;
   get points(): number;
}

export interface PowerupCompOpt {
   pos: Vec2,
   timeout: number;
   type: PowerupType;
}

const PowerupCompOptDefaults: PowerupCompOpt = {
   pos: vec2(128, 100),
   timeout: 20,
   type: 0,
};

export function addPowerup(options: Partial<PowerupCompOpt> = {}): GameObj<SpriteComp & AnchorComp & AreaComp & PosComp & ZComp & PowerupComp> {
   const opt = Object.assign({}, PowerupCompOptDefaults, options);
   return add([
      sprite('powerups', { frame: opt.type }),
      anchor('center'),
      pos(opt.pos),
      area({ scale: 0.6 }),
      lifespan(opt.timeout),
      z(5),
      powerup(opt),
   ]);
}

export function powerup(options: Partial<PowerupCompOpt> = {}): PowerupComp {
   const opt = Object.assign({}, PowerupCompOptDefaults, options),
         pointsRandomness = randi(1, 10) * 10;
   return {
      id: "powerup",
      timeout: opt.timeout,
      type: opt.type,
      get points() {
         return (this.type+1)*500 + pointsRandomness;
      },
      add() {
         play('item', { volume: getVol(DATA_SFX_VOL) });
         this.onCollide('player', player=>{
            play('powerup', { volume: getVol(DATA_SFX_VOL) });
            player.salt+=1;
            player.score+=this.points;
            const scoreIndicator = add([
               text(this.points, { align: 'center', size: 5 }),
               color(254, 147, 11),
               anchor('center'),
               pos(this.pos),
               lifespan(2, { fade: 0.5 }),
               z(999),
            ]);
            scoreIndicator.onUpdate(()=>{
               scoreIndicator.move(0, -3);
            });
            this.destroy();
         });
      },
   };
}

export function waitSpawnPowerup(options: Partial<PowerupCompOpt> = {}) {
   wait(randi(20, 60), ()=>{
      addPowerup({ ...options, type: randi(0, 2) as PowerupType }).onDestroy(()=>{
         waitSpawnPowerup(options);
      });
   });
}
