import { k } from '../kaboom';
import { Comp, Vec2 } from 'kaboom';

const { vec2 } = k;

export const ON_DIR_CHANGE = 'dirChange';

export interface WalkComp extends Comp {
   dir: Vec2;
   speed: number;
   stairSpeedMultiplier: number;
   restrictDir: (dir: Vec2) => Vec2;
   setDir: (dir: Vec2) => void;
   setIntendedDir: (dir: Vec2) => void;
   snap: (orientation: 'horiz' | 'vert') => void;
}

export function canWalk(): WalkComp {
   return {
      id: 'can-walk',
      require: ["sprite", "can-alive", "can-detect", "can-freeze"],
      dir: vec2(0),
      speed: 55,
      stairSpeedMultiplier: 0.7,
      restrictDir(dir) {
         let newdir = dir.clone();
         let intents = this.calcIntents(newdir);
         let status = this.calcDetectableStatus();
         if (newdir.x) {
            if (!status.floor || !intents.floor ) {
               newdir = vec2(0, newdir.y);
               intents = this.calcIntents(newdir);
            }
         }
         if (newdir.y) {
            if ((status.floor || status.stairtop) && intents.stair) {
               // Okay, you're getting on stairs from the floor or stairtop.
            } else if (intents.stairtop) {
               // Okay, you're walking toward stairtops.
            } else if (!status.stair || !intents.stair) {
               newdir = vec2(newdir.x, 0);
               intents = this.calcIntents(newdir);
            }
         }
         return newdir;
      },
      setDir(dir) {
         if (!this.dir.eq(dir)) {
            this.dir = dir;
            if (dir.x===0) this.snap('horiz');
            if (dir.y===0) this.snap('vert');
            this.trigger(ON_DIR_CHANGE, dir);
         }
      },
      setIntendedDir(dir) {
         if (this.isFrozen || !this.isAlive) return;
         this.setDir(this.restrictDir(dir));
      },
      snap(orientation) {
         const status = this.calcDetectableStatus();
         if (orientation==='vert' && status.floor) {
            let y: number = this.pos.y;
            const mod = -(y % 8 - 5);
            if (mod!==0) this.moveTo(this.pos.add(0, mod));
         } else if (orientation==='horiz' && status.stair) {
            let mod = -(this.pos.x % 8);
            if (Math.abs(mod)>4) mod+=8;
            if (mod!==0) this.moveTo(this.pos.add(mod, 0));
         }
      },
      update() {
         if (this.isFrozen || !this.isAlive) return;
         // Check restrictions on movement
         const newdir = this.restrictDir(this.dir);
         if (!newdir.eq(this.dir)) {
            this.setDir(newdir);
         }
         // Move
         if (!this.dir.isZero()) {
            this.move((this.dir as Vec2).scale(this.dir.y ? this.speed * this.stairSpeedMultiplier : this.speed));
         }
      },
   };
}