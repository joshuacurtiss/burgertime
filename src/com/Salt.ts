import { k } from '../kaboom';
import { Comp } from 'kaboom';

const {
   add,
   anchor,
   area,
   pos,
   sprite,
   vec2,
   wait,
   z,
} = k;

type SaltChangeCallbackFn = (saltQty: number)=>void;

export interface SaltComp extends Comp {
   saltDelay: number;
   throwSalt: ()=>void;
   get salt(): number;
   set salt(qty: number);
   onSaltChange: (fn: SaltChangeCallbackFn)=>void;
}

export function canSalt(): SaltComp {
   const saltChangeCallbacks: SaltChangeCallbackFn[] = [];
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
         saltChangeCallbacks.forEach(fn=>fn(saltQty));
      },
      add() {
         this.onDirChange(newdir=>{
            // Set last MOVING direction, never the idle state.
            if (!newdir.isZero()) saltDir = newdir;
         });
      },
      onSaltChange(fn) {
         saltChangeCallbacks.push(fn);
      },
      throwSalt() {
         if (this.isFrozen || !this.isAlive) return;
         if (!this.salt) {
            // TODO: Play empty salt sound
            return;
         }
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
         // TODO: Play salt sound
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
