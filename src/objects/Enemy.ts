import { k } from '../kaboom';
import {
   AnchorComp,
   AreaComp,
   Comp,
   GameObj,
   PosComp,
   SpriteComp,
   Vec2,
   ZComp,
} from 'kaboom';
import { canAlive, AliveComp } from '../abilities/Alive';
import { canChase, ChaseComp } from '../abilities/Chase';
import { canFreeze, FreezeComp } from '../abilities/Freeze';
import { canWalk, WalkComp } from '../abilities/Walk';

const {
   add,
   anchor,
   area,
   pos,
   Rect,
   sprite,
   vec2,
   wait,
   z,
} = k;

type EnemyType = 'hotdog' | 'pickle' | 'egg';

export interface EnemyComp extends Comp {
   type: EnemyType;
   stunDelay: number;
   get isStunned(): boolean;
   stun: ()=>void;
}

export interface EnemyCompOpt {
   pos: Vec2;
   type: EnemyType;
}

const EnemyCompOptDefaults: EnemyCompOpt = {
   pos: vec2(0),
   type: 'hotdog',
};

export function addEnemy(options: Partial<EnemyCompOpt> = {}): GameObj<SpriteComp & AnchorComp & AreaComp & PosComp & ZComp & EnemyComp & AliveComp & ChaseComp & FreezeComp & WalkComp> {
   const opt = Object.assign({}, EnemyCompOptDefaults, options);
   return add([
      sprite('enemies', { anim: `${opt.type}-walk` }),
      anchor('center'),
      pos(opt.pos),
      area({ shape: new Rect(vec2(0), 7, 15), offset: vec2(0), collisionIgnore: ['powerup'] }),
      z(20),
      opt.type,
      canAlive(),
      canChase(),
      canFreeze(),
      canWalk(),
      enemy(opt),
   ]);
}

export function enemy(options: Partial<EnemyCompOpt> = {}): EnemyComp {
   const opt = Object.assign({}, EnemyCompOptDefaults, options);
   let stunned = false;
   let stunTimer;
   return {
      id: 'enemy',
      type: opt.type,
      stunDelay: 5,
      get isStunned() {
         return stunned;
      },
      stun() {
         stunTimer?.cancel();
         stunned = true;
         this.freeze();
         this.play(`${this.type}-stun`);
         stunTimer = wait(this.stunDelay, () => {
            stunned = false;
            this.unfreeze();
            this.play(`${this.type}-walk`);
         });
      },
      add() {
         this.speed = 28;
         this.onCollide('salt', this.stun);
      },
   };
}
