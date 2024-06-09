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
import { DetectComp, canDetect } from '../abilities/Detect';
import { canFreeze, FreezeComp } from '../abilities/Freeze';
import { canWalk, ON_DIR_CHANGE, WalkComp } from '../abilities/Walk';

const {
   add,
   anchor,
   area,
   play,
   pos,
   randi,
   Rect,
   sprite,
   vec2,
   wait,
   z,
} = k;

export type Enemy = GameObj<SpriteComp & AnchorComp & AreaComp & PosComp & ZComp & EnemyComp & AliveComp & ChaseComp & DetectComp & FreezeComp & WalkComp>;
export type EnemyType = 'hotdog' | 'pickle' | 'egg';

export interface EnemyComp extends Comp {
   type: EnemyType;
   stunDelay: number;
   get isStunned(): boolean;
   squash: ()=>void;
   stun: ()=>void;
   setAnim: (dir: Vec2) => void;
}

export interface EnemyCompOpt {
   pos: Vec2;
   type: EnemyType;
}

const EnemyCompOptDefaults: EnemyCompOpt = {
   pos: vec2(0),
   type: 'hotdog',
};

export function addEnemy(options: Partial<EnemyCompOpt> = {}): Enemy {
   const opt = Object.assign({}, EnemyCompOptDefaults, options);
   return add([
      sprite('enemies', { anim: `${opt.type}-walk` }),
      anchor('center'),
      pos(opt.pos),
      area({ shape: new Rect(vec2(0, 2), 7, 10), offset: vec2(0), collisionIgnore: ['powerup'] }),
      z(20),
      opt.type,
      canAlive(),
      canChase(),
      canDetect({ stairPrecision: 1 }),
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
      squash() {
         if (this.isFrozen) return;
         this.freeze();
         this.play(`${this.type}-squash`);
         play('enemy_squash');
         wait(0.5, ()=>this.pos = vec2(-20));
         wait(randi(8, 20), ()=>{
            this.setAnim(vec2(0));
            this.pos = opt.pos.clone();
            this.unfreeze();
         });
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
      setAnim(newdir) {
         let anim = 'walk';
         let flipX = newdir.x>0;
         if (newdir.y<0) anim = 'up';
         else if (newdir.y>0) anim = 'down';
         if (this.curAnim() !== anim) this.play(`${this.type}-${anim}`);
         this.flipX = flipX;
      },
      add() {
         this.speed = 28;
         this.on(ON_DIR_CHANGE, this.setAnim);
         this.onCollide('salt', this.stun);
      },
   };
}
