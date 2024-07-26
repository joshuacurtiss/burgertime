import {
   AnchorComp,
   Comp,
   GameObj,
   PosComp,
   SpriteComp,
   TileComp,
   Vec2,
} from 'kaboom';

const FLOOR_DY = 3;

export type DetectableObj = GameObj<PosComp & TileComp & SpriteComp & AnchorComp>;

export interface DetectableStatus {
   floor: boolean;
   plate: boolean;
   stair: boolean;
   stairtop: boolean
}

export interface DetectComp extends Comp {
   /**
    * Fills the component with known detectable objects so it can do its
    * calculations.
    */
   setObjects: (obj: { floors?: DetectableObj[], plates?: DetectableObj[], stairs?: DetectableObj[], stairtops?: DetectableObj[] }) => void;

   /**
    * Calculates the status of the object based on its current position
    * relative to detectable objects it knows about, like floors, stairs, and
    * stairtops.
    */
   calcDetectableStatus: () => DetectableStatus;

   /**
    * Calculates the status based on the *intended direction* rather than
    * actual position. This is really only intended for use with enemies and
    * players, and technically requires "sprite" component, but this
    * ability doesn't require "sprite" component so that slices (which are a
    * collection of multiple sprites) can use it.
    */
   calcIntents: (dir: Vec2) => DetectableStatus;

   /**
    * Get width, even if component has no sprite, by getting the cumulative
    * width of its children.
    */
   getWidth(): number;

   /**
    * Get height, even if component has no sprite, by getting the cumulative
    * height of its children.
    */
   getHeight(): number;
}

export interface DetectCompOpt {
   floorPrecision: number;
   stairPrecision: number;
}

const DetectCompOptDefaults: DetectCompOpt = {
   floorPrecision: 1.75,
   stairPrecision: 3,
};

export function withinFloor(obj: DetectableObj, pos: Vec2, precision=1.75) {
   if (Math.abs(pos.y-obj.pos.y)>precision) return false;
   return pos.x>=obj.pos.x && pos.x<obj.pos.x+obj.width;
}

export function withinStairs(obj: DetectableObj, pos: Vec2, precision=3) {
   if (obj.is('stairleft')) {
      if (pos.x<obj.pos.x+obj.width-precision || pos.x>obj.pos.x+obj.width) return false;
   } else {
      if (pos.x<obj.pos.x || pos.x>obj.pos.x+precision) return false;
   }
   // On stairtops, we only look at bottom half of the tile.
   const dy = obj.is('stairtop') ? obj.height/2 : 0;
   return pos.y>=obj.pos.y+dy && pos.y<=obj.pos.y+obj.height;
}

export function within(objs: DetectableObj[], pos: Vec2, method: (obj: DetectableObj, pos: Vec2, precision?: number)=>boolean, precision?: number) {
   return objs.some(obj=>method(obj, pos, precision));
}

export function canDetect(options: Partial<DetectCompOpt> = {}): DetectComp {
   const opt = Object.assign({}, DetectCompOptDefaults, options);
   let floors: DetectableObj[] = [];
   let plates: DetectableObj[] = [];
   let stairs: DetectableObj[] = [];
   let stairtops: DetectableObj[] = [];

   return {
      id: 'can-detect',
      require: ["pos"],
      setObjects(obj) {
         if (obj.floors) floors = obj.floors;
         if (obj.plates) plates = obj.plates;
         if (obj.stairs) stairs = obj.stairs;
         if (obj.stairtops) stairtops = obj.stairtops;
      },
      getHeight() {
         if (this.height) return this.height;
         return Math.max(...this.children.map(c=>c.pos.y+c.height)) - Math.min(...this.children.map(c=>c.pos.y));
      },
      getWidth() {
         if (this.width) return this.width;
         return Math.max(...this.children.map(c=>c.pos.x+c.width)) - Math.min(...this.children.map(c=>c.pos.x));
      },
      calcDetectableStatus() {
         const halfHeight = this.getHeight() / 2;
         const dy = this.is('slice') ? 0 : FLOOR_DY;
         return {
            floor: within(floors, this.pos.add(0, dy), withinFloor, opt.floorPrecision),
            plate: within(plates, this.pos.add(0, dy), withinFloor, opt.floorPrecision),
            stair: within(stairs, this.pos.add(0, halfHeight), withinStairs, opt.stairPrecision),
            stairtop: within(stairtops, this.pos.add(0, halfHeight), withinStairs, opt.stairPrecision),
         };
      },
      calcIntents(dir: Vec2, mode: 'step' | 'tile' = 'step') {
         // These are basically magic numbers that work "just right" with enemies and players.
         const halfHeight = this.getHeight() / 2,
               halfWidth = this.getWidth() / 2,
               intendedLoc = this.pos
                  // Start at the feet
                  .add(0, halfHeight)
                  // Go to edge of sprite, like the "next step"
                  .add(dir.x*halfWidth, dir.y<=0 ? -0.175*halfHeight : halfHeight*0.42)
                  // Go to next tile if mode is 'tile'
                  .add(mode==='tile' ? dir.x*5 : 0, mode==='tile' ? dir.y*3 : 0);
         return {
            floor: !!dir.x && within(floors, intendedLoc.add(0, -FLOOR_DY), withinFloor, opt.floorPrecision),
            plate: false, // Plates are not walkable by enemies and players
            stair: !!dir.y && within(stairs, intendedLoc, withinStairs, opt.stairPrecision),
            stairtop: !!dir.y && within(stairtops, intendedLoc, withinStairs, opt.stairPrecision),
         };
      },
   };
}
