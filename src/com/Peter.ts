import { k } from '../kaboom';
import { Comp } from 'kaboom';

const {
   isKeyDown,
   lifespan,
   vec2,
} = k;

export interface PeterComp extends Comp {
   isFrozen: boolean;
   isAlive: boolean;
   freeze: Function;
   die: Function;
}

export function peter(): PeterComp {
   return {
      id: "peter",
      require: ["area", "sprite", "can-walk"],
      isFrozen: false,
      isAlive: true,
      add() {
         this.onDirChange(newdir=>{
            let anim = 'idle';
            let flipX = newdir.x>0;
            if (newdir.y<0) anim = 'up';
            else if (newdir.y>0) anim = 'down';
            else if (newdir.x) anim = 'walk';
            if (this.curAnim() !== anim) this.play(anim);
            this.flipX = flipX;
         });
      },
      update() {
         if (this.isFrozen) {
            return;
         }
         let dir = vec2(0);
         if (isKeyDown("left")) dir = vec2(-1, 0);
         else if (isKeyDown("right")) dir = vec2(1, 0);
         else if (isKeyDown("up")) dir = vec2(0, -1);
         else if (isKeyDown("down")) dir = vec2(0, 1);
         this.setIntendedDir(dir);
      },
      freeze() {
         this.isFrozen = true;
      },
      die() {
         this.unuse("body");
         this.isAlive = false;
         this.use(lifespan(1, { fade: 1 }));
      },
   };
}