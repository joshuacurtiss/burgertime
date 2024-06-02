import { k } from '../kaboom';
import {
   AreaComp,
   GameObj,
   PosComp,
   SpriteComp,
} from 'kaboom';

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

export interface Enemy extends GameObj<SpriteComp & AreaComp & PosComp> {
   type: EnemyType;
   stunDelay: number;
   get isStunned(): boolean;
   stun: ()=>void;
}

export function enemy(type: EnemyType, position = vec2(-10)): Enemy {
   let stunned = false;
   let stunTimer;
   const enemy = add([
      sprite('enemies', { anim: `${type}-walk` }),
      anchor('center'),
      pos(position),
      area({ shape: new Rect(vec2(0), 7, 15), offset: vec2(0), collisionIgnore: ['powerup'] }),
      z(20),
      type,
      {
         type,
         stunDelay: 5,
         get isStunned() {
            return stunned;
         },
         stun() {
            stunTimer?.cancel();
            stunned = true;
            this.play(`${type}-stun`);
            stunTimer = wait(this.stunDelay, () => {
               stunned = false;
               this.play(`${type}-walk`);
            });
         },
      },
      "enemy",
   ]);
   enemy.onCollide('salt', enemy.stun);
   return enemy;
}
