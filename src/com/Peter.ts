import { k } from '../kaboom';
import { Comp } from 'kaboom';

const {
   isKeyDown,
   lifespan,
   onKeyRelease,
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
         onKeyRelease('up', ()=>this.snap('vert'));
         onKeyRelease('down', ()=>this.snap('vert'));
         onKeyRelease('left', ()=>this.snap('horiz'));
         onKeyRelease('right', ()=>this.snap('horiz'));
      },
      update() {
         if (this.isFrozen) {
            return;
         }
         let anim = 'idle';
         let dir = vec2(0);
         let flipX = false;
         if (isKeyDown("up")) {
            anim = 'up';
            dir = dir.add(0, -1);
         }
         if (isKeyDown("down")) {
            anim = 'down';
            dir = dir.add(0, 1);
         }
         if (isKeyDown("left")) {
            anim = 'walk';
            dir = dir.add(-1, 0);
         }
         if (isKeyDown("right")) {
            anim = 'walk';
            dir = dir.add(1, 0);
            flipX = true;
         }
         this.dir = dir;
         this.flipX = flipX;
         if (this.curAnim() !== anim) this.play(anim);
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