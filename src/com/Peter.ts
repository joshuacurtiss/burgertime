import { k } from '../kaboom';
import { Comp, Vec2 } from 'kaboom';

const {
   isKeyDown,
   onKeyPress,
   vec2,
   wait,
} = k;

type DieCallbackFn = (player: PeterComp)=>void;

export interface PeterComp extends Comp {
   isFrozen: boolean;
   isAlive: boolean;
   freeze: Function;
   die: Function;
   get lives(): number;
   onDie: (fn: DieCallbackFn) => void;
   setAnim: (dir: Vec2) => void;
}

export function peter(): PeterComp {
   const dieCallbacks: DieCallbackFn[] = [];
   let lives = 4;
   return {
      id: "peter",
      require: ["area", "sprite", "can-salt", "can-walk"],
      isFrozen: false,
      isAlive: true,
      add() {
         onKeyPress(key=>{
            if (key==='space') {
               this.throwSalt();
            }
         });
         this.onCollide("enemy", enemy=>{
            if (enemy.isStunned) return;
            this.die();
         });
         this.onDirChange(this.setAnim);
      },
      onDie(fn) {
         dieCallbacks.push(fn);
      },
      setAnim(newdir) {
         let anim = 'idle';
         let flipX = newdir.x>0;
         if (newdir.y<0) anim = 'up';
         else if (newdir.y>0) anim = 'down';
         else if (newdir.x) anim = 'walk';
         if (this.curAnim() !== anim) this.play(anim);
         this.flipX = flipX;
      },
      update() {
         if (this.isFrozen || !this.isAlive) return;
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
      get lives() {
         return lives;
      },
      async die() {
         this.isAlive = false;
         lives-=1;
         this.stop();
         this.frame = 14;
         await wait(1);
         this.play("fall");
         await wait(0.55);
         this.play("dead");
         await wait(1);
         dieCallbacks.forEach(fn=>fn(this));
      },
   };
}