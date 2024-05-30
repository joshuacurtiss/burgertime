import { k } from '../kaboom';
import {
   AnchorComp,
   CircleComp,
   ColorComp,
   Comp,
   GameObj,
   PosComp,
   SpriteComp,
   TextComp,
   TileComp,
   Vec2,
} from 'kaboom';

const {
   add,
   anchor,
   circle,
   color,
   debug,
   pos,
   text,
   vec2,
   RED,
   WHITE,
} = k;

export type WalkableObj = GameObj<PosComp & TileComp & SpriteComp & AnchorComp>;

export interface WalkComp extends Comp {
   dir: Vec2;
   onFloor: boolean;
   onStair: boolean;
   speed: number;
   stairSpeedMultiplier: number;
   calcIntendedLocation: () => void;
   calcWalkableStatus: () => void;
   setObjects: (obj: { floors: WalkableObj[], stairs: WalkableObj[], stairtops: WalkableObj[] }) => void;
   snap: (orientation: 'horiz' | 'vert') => void;
}

export function canWalk(): WalkComp {
   let intendedLocation: GameObj<PosComp & CircleComp & AnchorComp>;
   let txtPos: GameObj<PosComp & TextComp & ColorComp>;
   let txtFloor: GameObj<PosComp & TextComp & ColorComp>;
   let txtStair: GameObj<PosComp & TextComp & ColorComp>;
   let floors: WalkableObj[];
   let stairs: WalkableObj[];
   let stairtops: WalkableObj[];

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
      require: ["sprite"],
      dir: vec2(0),
      speed: 55,
      stairSpeedMultiplier: 0.7,
      onFloor: false,
      onStair: false,
      add() {
         intendedLocation = add([
            pos(),
            circle(1),
            anchor('center'),
         ]);
         intendedLocation.hidden = !debug.inspect;
         if (debug.inspect) {
            txtFloor = add([
               text('Floor', { size: 5 }),
               pos(40, 5.5),
               color(WHITE),
            ]);
            txtStair = add([
               text('Stair', { size: 5 }),
               pos(65, 5.5),
               color(WHITE),
            ]);
            txtPos = add([
               text('', { size: 5 }),
               pos(90, 5.5),
               color(WHITE),
            ]);
         }
      },
      setObjects(obj) {
         floors = obj.floors;
         stairs = obj.stairs;
         stairtops = obj.stairtops;
      },
      calcWalkableStatus() {
         this.onFloor = within(floors, this.pos.add(0, 3), withinFloor);
         this.onStair = within(stairs, this.pos.add(0, 8), withinStairs);
      },
      calcIntendedLocation() {
         intendedLocation.pos = this.pos.add(0, this.area.shape.height/2).add(this.dir.x * this.area.shape.width/1.5, this.dir.y<=0 ? this.dir.y : 3.75);
      },
      snap(orientation) {
         this.calcWalkableStatus();
         if (orientation==='vert' && this.onFloor) {
            let y: number = this.pos.y;
            const mod = -(y % 8 - 5);
            this.moveTo(this.pos.add(0, mod));
         } else if (orientation==='horiz' && this.onStair) {
            let mod = -(this.pos.x % 8);
            if (Math.abs(mod)>4) mod+=8;
            this.moveTo(this.pos.add(mod, 0));
         }
      },
      update() {
         // Determine location status (on floor or stair)
         this.calcWalkableStatus();
         // Make movement corrections based on restrictions
         this.calcIntendedLocation();
         if (this.dir.x) {
            const intendedOnFloor = within(floors, intendedLocation.pos.add(0, -4.5), withinFloor);
            if (!this.onFloor || !intendedOnFloor ) {
               this.dir.x=0;
               this.calcIntendedLocation();
            }
         }
         if (this.dir.y) {
            const intendedOnStairs = within(stairs, intendedLocation.pos, withinStairs);
            const intendedOnStairtop = within(stairtops, intendedLocation.pos, withinStairtops);
            const onStairtop = within(stairtops, this.pos.add(0, 8), withinStairtops);
            if (this.onFloor && intendedOnStairs) {
               // Okay, you're getting on stairs from the floor
            } else if (onStairtop && intendedOnStairs) {
               // Or, you're on the stairtop trying to walk on stairs.
            } else if (intendedOnStairtop) {
               // Also okay, you're walking toward stairtops
            } else if (!this.onStair || !intendedOnStairs) {
               this.dir.y=0;
               this.calcIntendedLocation();
            }
         }
         // Move
         if (!this.dir.isZero()) {
            this.move((this.dir as Vec2).scale(this.dir.y ? this.speed * this.stairSpeedMultiplier : this.speed));
         }
         // Update debugging dashboard
         if (debug.inspect) {
            txtPos.text = `${this.pos.x.toFixed(2)}, ${this.pos.y.toFixed(2)}`;
            txtStair.color = this.onStair ? RED : WHITE;
            txtFloor.color = this.onFloor ? RED : WHITE;
         }
      },
   };
}