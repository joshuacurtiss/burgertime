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
import { SaltComp, canSalt } from '../abilities/Salt';
import { ScoreComp, canScore } from '../abilities/Score';
import { WalkComp, WalkableObj, canWalk } from '../abilities/Walk';

const {
   add,
   anchor,
   area,
   isKeyDown,
   onKeyPress,
   pos,
   Rect,
   sprite,
   stay,
   vec2,
   wait,
   z,
} = k;

type DieCallbackFn = (player: PeterComp)=>void;

export interface PeterComp extends Comp {
   isInitialized: boolean;
   isFrozen: boolean;
   isAlive: boolean;
   freeze: Function;
   die: Function;
   get lives(): number;
   onDie: (fn: DieCallbackFn) => void;
   setAnim: (dir: Vec2) => void;
}

export interface PeterCompOpt {
   pos: Vec2;
   walkableObjects: {
      floors: WalkableObj[];
      stairs: WalkableObj[];
      stairtops: WalkableObj[];
   },
};

const PeterCompOptDefaults: PeterCompOpt = {
   pos: vec2(0),
   walkableObjects: {
      floors: [],
      stairs: [],
      stairtops: [],
   },
};

export type PeterObj = GameObj<SpriteComp & AnchorComp & AreaComp & PosComp & ZComp & PeterComp & SaltComp & ScoreComp & WalkComp>;

export function addPeter(options: Partial<PeterCompOpt> = {}): PeterObj {
   const opt = Object.assign({}, PeterCompOptDefaults, options);
   return add([
      sprite("peter", { anim: 'idle' }),
      area({ shape: new Rect(vec2(0), 8, 15) }),
      anchor('center'),
      pos(opt.pos),
      stay(['game', 'gameover']),
      peter(opt),
      canSalt(),
      canScore(),
      canWalk(),
      z(10),
      "player",
   ]);
}

export function peter(options: Partial<PeterCompOpt> = {}): PeterComp {
   const opt = Object.assign({}, PeterCompOptDefaults, options);
   const dieCallbacks: DieCallbackFn[] = [];
   let lives = 4;
   return {
      id: "peter",
      require: ["area", "sprite", "can-salt", "can-walk"],
      isFrozen: false,
      isInitialized: false,
      isAlive: false,
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
         this.setObjects(opt.walkableObjects);
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
         dieCallbacks.forEach(fn=>fn(this));
      },
   };
}
