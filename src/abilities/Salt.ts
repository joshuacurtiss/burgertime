import { k, getVol, DATA_SFX_VOL } from '../kaboom';
import { Comp } from 'kaboom';
import { ON_DIR_CHANGE } from '../abilities/Walk';

const {
   add,
   anchor,
   area,
   play,
   pos,
   sprite,
   vec2,
   wait,
   z,
} = k;

export const ON_SALT_CHANGE = 'saltChange';

export interface SaltComp extends Comp {
   saltDelay: number;
   throwSalt: ()=>void;
   get salt(): number;
   set salt(qty: number);
}

export function canSalt(): SaltComp {
   let saltQty = 5;
   let saltDir = vec2(1, 0);
   return {
      id: "can-salt",
      require: ["peter", "can-walk"],
      saltDelay: 0.6,
      get salt() {
         return saltQty;
      },
      set salt(qty) {
         saltQty = qty;
         this.trigger(ON_SALT_CHANGE, saltQty);
      },
      add() {
         this.on(ON_DIR_CHANGE, newdir=>{
            // Set last MOVING direction, never the idle state.
            if (!newdir.isZero()) saltDir = newdir;
         });
      },
      throwSalt() {
         if (this.isFrozen || !this.isAlive) return;
         if (!this.salt) return;
         this.salt-=1;
         const saltPos = this.pos.sub(0, this.height/4).add(saltDir.x*this.width*0.75, saltDir.y*this.height),
               saltTop = add([
                  sprite('salt', { frame: 1, flipX: saltDir.x>0 }),
                  anchor('center'),
                  pos(saltPos),
                  area({collisionIgnore: ['player']}),
                  z(50),
                  "salt",
               ]),
               saltBottom = add([
                  sprite('salt', { frame: 2, flipX: saltDir.x>0 }),
                  anchor('center'),
                  pos(saltPos.add(0, saltTop.height)),
                  area({collisionIgnore: ['player']}),
                  z(50),
                  "salt",
               ]);
         play('pepper', { volume: getVol(DATA_SFX_VOL) });
         const anim = saltDir.x ? 'throw' : saltDir.y<0 ? 'throw-up' : 'throw-down';
         this.flipX = saltDir.x>0;
         this.play(anim);
         wait(this.saltDelay, ()=>{
            saltTop.destroy();
            saltBottom.destroy();
            if (this.isFrozen || !this.isAlive) return;
            this.setAnim(this.dir);
         });
      },
   };
};
