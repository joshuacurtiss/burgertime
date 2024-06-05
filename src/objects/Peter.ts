import { k } from '../kaboom';
import {
   AnchorComp,
   AreaComp,
   Comp,
   GameObj,
   GamepadButton,
   Key,
   PosComp,
   SpriteComp,
   Vec2,
   ZComp,
} from 'kaboom';
import { SaltComp, canSalt } from '../abilities/Salt';
import { ScoreComp, canScore } from '../abilities/Score';
import { ON_DIR_CHANGE, WalkComp, WalkableObj, canWalk } from '../abilities/Walk';

const {
   add,
   anchor,
   area,
   pos,
   Rect,
   sprite,
   stay,
   vec2,
   wait,
   z,
} = k;

export const ON_DIE = 'die';
export const ON_WIN = 'win';

export interface PeterControls {
   keyboard: {
      left: Key;
      right: Key;
      up: Key;
      down: Key;
      action: Key;
   };
   gamepad: {
      left: GamepadButton;
      right: GamepadButton;
      up: GamepadButton;
      down: GamepadButton;
      action: GamepadButton;
   }
};

export interface PeterComp extends Comp {
   controls: PeterControls;
   isInitialized: boolean;
   isFrozen: boolean;
   isAlive: boolean;
   level: number;
   lives: number;
   freeze: Function;
   action: Function;
   die: Function;
   win: Function;
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
   return {
      id: "peter",
      require: ["area", "sprite", "can-salt", "can-walk"],
      controls: {
         keyboard: {
            action: "space",
            left: "left",
            right: "right",
            up: "up",
            down: "down",
         },
         gamepad: {
            action: "south",
            left: "dpad-left",
            right: "dpad-right",
            up: "dpad-up",
            down: "dpad-down",
         },
      },
      isFrozen: false,
      isInitialized: false,
      isAlive: false,
      level: 0,
      lives: 4,
      add() {
         this.onCollide("enemy", enemy=>{
            if (enemy.isStunned) return;
            this.die();
         });
         this.on(ON_DIR_CHANGE, this.setAnim);
         this.setObjects(opt.walkableObjects);
      },
      action() {
         this.throwSalt();
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
      freeze() {
         this.isFrozen = true;
      },
      async win() {
         this.freeze();
         this.level+=1;
         this.stop();
         for (let i=0 ; i<10 ; i+=1) {
            this.play(i % 2 ? 'celebrate' : 'idle');
            await wait(0.4);
         }
         this.trigger(ON_WIN, this);
      },
      async die() {
         this.isAlive = false;
         this.lives-=1;
         this.stop();
         this.frame = 14;
         await wait(1);
         this.play("fall");
         await wait(0.55);
         this.play("dead");
         this.trigger(ON_DIE, this);
      },
   };
}
