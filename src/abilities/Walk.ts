import { k } from '../kaboom';
import {
   AnchorComp,
   Comp,
   GameObj,
   PosComp,
   SpriteComp,
   TileComp,
   Vec2,
} from 'kaboom';

const {
   vec2,
} = k;

export const ON_DIR_CHANGE = 'dirChange';
export type WalkableObj = GameObj<PosComp & TileComp & SpriteComp & AnchorComp>;

interface WalkableStatus {
   floor: boolean;
   stair: boolean;
   stairtop: boolean
}

export interface WalkComp extends Comp {
   dir: Vec2;
   speed: number;
   stairSpeedMultiplier: number;
   calcIntents: (dir: Vec2) => WalkableStatus;
   calcWalkableStatus: () => WalkableStatus;
   restrictDir: (dir: Vec2) => Vec2;
   setDir: (dir: Vec2) => void;
   setIntendedDir: (dir: Vec2) => void;
   setObjects: (obj: { floors: WalkableObj[], stairs: WalkableObj[], stairtops: WalkableObj[] }) => void;
   snap: (orientation: 'horiz' | 'vert') => void;
}

export function canWalk(): WalkComp {
   let floors: WalkableObj[] = [];
   let stairs: WalkableObj[] = [];
   let stairtops: WalkableObj[] = [];

   function withinFloor(obj: WalkableObj, pos: Vec2) {
      if (Math.abs(pos.y-obj.pos.y)>1.75) return false;
      return pos.x>=obj.pos.x && pos.x<=obj.pos.x+obj.width;
   }

   function withinStairs(obj: WalkableObj, pos: Vec2) {
      if (obj.is('stairleft')) {
         if (pos.x<obj.pos.x+5 || pos.x>obj.pos.x+obj.width) return false;
      } else {
         if (pos.x<obj.pos.x || pos.x>obj.pos.x+obj.width-5) return false;
      }
      return pos.y>=obj.pos.y && pos.y<=obj.pos.y+obj.height;
   }

   function withinStairtops(obj: WalkableObj, pos: Vec2) {
      if (obj.is('stairleft')) {
         if (pos.x<obj.pos.x+5 || pos.x>obj.pos.x+obj.width) return false;
      } else {
         if (pos.x<obj.pos.x || pos.x>obj.pos.x+obj.width-5) return false;
      }
      return pos.y>=obj.pos.y+obj.height/2 && pos.y<=obj.pos.y+obj.height;
   }

   function within(objs: WalkableObj[], pos: Vec2, method: (obj: WalkableObj, pos: Vec2)=>boolean) {
      return objs.some(obj=>method(obj, pos));
   }

   return {
      id: 'can-walk',
      require: ["sprite", "can-alive", "can-freeze"],
      dir: vec2(0),
      speed: 55,
      stairSpeedMultiplier: 0.7,
      setObjects(obj) {
         floors = obj.floors;
         stairs = obj.stairs;
         stairtops = obj.stairtops;
      },
      calcWalkableStatus() {
         return {
            floor: within(floors, this.pos.add(0, 3), withinFloor),
            stair: within(stairs, this.pos.add(0, 8), withinStairs),
            stairtop: within(stairtops, this.pos.add(0, 8), withinStairtops),
         };
      },
      calcIntents(dir) {
         const intendedLoc = this.pos.add(0, this.area.shape.height/2).add(dir.x * this.area.shape.width/1.5, dir.y<=0 ? dir.y : 3.75);
         return {
            floor: !!dir.x && within(floors, intendedLoc.add(0, -4.5), withinFloor),
            stair: !!dir.y && within(stairs, intendedLoc, withinStairs),
            stairtop: !!dir.y && within(stairtops, intendedLoc, withinStairtops),
         };
      },
      restrictDir(dir) {
         let newdir = dir.clone();
         let intents = this.calcIntents(newdir);
         let status = this.calcWalkableStatus();
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
         const status = this.calcWalkableStatus();
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