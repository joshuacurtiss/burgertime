import { k, getVol, DATA_SFX_VOL } from '../kaboom';
import {
   Comp,
   GameObj,
   PosComp,
   Vec2,
} from 'kaboom';
import { DetectableStatus, DetectComp, canDetect } from '../abilities/Detect';
import { Enemy } from './Enemy';

const {
   add,
   anchor,
   area,
   play,
   pos,
   Rect,
   sprite,
   vec2,
   wait,
   z,
} = k;

export type SliceType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type SliceBitType = 0 | 1 | 2 | 3;
export type Slice = GameObj<PosComp & DetectComp & SliceComp>;

export const ON_SLICE_FALL = 'sliceFall';
export const ON_SLICE_LAND = 'sliceLand';
export const ON_SLICE_PLATE = 'slicePlate';

const Y_NORMAL = -2;
const Y_TRAMPLED = -1;
const FALL_SPEED = 55;

function isSliceBitType(num: number): num is SliceBitType {
   return num>=0 && num<4;
}

export interface SliceComp extends Comp {
   get fallCount(): number;
   get type(): SliceType;
   get enemies(): Enemy[];
   set enemies(arr: Enemy[]);
   get isTrampled(): boolean;
   get isFalling(): boolean;
   set isFalling(bool: boolean);
   get isOnPlate(): boolean;
   set isOnPlate(bool: boolean);
   mimic: (otherSlice: Slice) => void;
   fall: Function;
   land: Function;
}

export interface SliceCompOpt {
   pos: Vec2,
   type: SliceType;
}

const SliceCompOptDefaults: SliceCompOpt = {
   pos: vec2(0),
   type: 0,
};

export function addSlice(options: Partial<SliceCompOpt> = {}): Slice {
   const opt = Object.assign({}, SliceCompOptDefaults, options);
   return add([
      anchor('center'),
      pos(opt.pos),
      canDetect({ floorPrecision: 0.5 }),
      slice(opt),
   ]);
}

export function slice(options: Partial<SliceCompOpt> = {}): SliceComp {
   let enemies: Enemy[] = [];
   let onPlate = false;
   let fallCount = 0;
   let fallCountY = 0;
   const opt = Object.assign({}, SliceCompOptDefaults, options),
         dir = vec2(0),
         type = opt.type;
   return {
      id: "slice",
      get fallCount() {
         return fallCount;
      },
      get type() {
         return type;
      },
      get isTrampled() {
         return this.children.every(child=>child.pos.y == Y_TRAMPLED);
      },
      get isFalling() {
         return !dir.isZero();
      },
      get isOnPlate() {
         return onPlate;
      },
      get enemies() {
         return enemies;
      },
      set enemies(arr: Enemy[]) {
         enemies = arr;
         fallCount = enemies.length ? (enemies.length+2) : 0;
         enemies.forEach(enemy=>enemy.freeze());
         if (enemies.length) play('enemy_fall', { volume: getVol(DATA_SFX_VOL) });
      },
      set isOnPlate(bool) {
         const changed = onPlate!==bool;
         onPlate = bool;
         if (bool && changed) this.trigger(ON_SLICE_PLATE, this);
      },
      mimic(otherSlice: Slice) {
         this.pos = otherSlice.pos.clone();
         onPlate = otherSlice.isOnPlate;
         this.children.forEach((bit, i)=>{
            bit.pos = otherSlice.children[i].pos.clone();
         });
      },
      fall(newFallCount=0) {
         if (this.isFalling || this.isOnPlate) return;
         this.pos = this.pos.add(0, 1);
         dir.y = FALL_SPEED;
         fallCount = newFallCount<0 ? 0 : newFallCount;
         play('burger_drop', { volume: getVol(DATA_SFX_VOL) });
         this.trigger(ON_SLICE_FALL, this);
      },
      land() {
         if (dir.isZero()) return;
         dir.y = 0;
         this.children.forEach(child=>child.pos.y = Y_NORMAL);
         play('burger_floor', { volume: getVol(DATA_SFX_VOL) });
         enemies.forEach(enemy=>{
            enemy.pos.y = this.pos.y-3;
            if (this.isOnPlate) {
               enemy.unfreeze();
               enemy.squash();
            }
            else wait(2, ()=>{
               enemy.unfreeze();
               enemy.setDir(vec2(0));
            });
         });
         this.trigger(ON_SLICE_LAND, this);
         enemies = [];
      },
      add() {
         for (let bit: SliceBitType=0 ; bit<4 ; bit+=1) {
            if (isSliceBitType(bit)) this.add([
               sprite('burger', { frame: opt.type*4 + bit }),
               pos(vec2(bit*8, Y_NORMAL)),
               area({ shape: new Rect(vec2(bit<2 ? 1 : 3, 4), 4, 2) }),
               z(7),
               "slice-bit"
            ]);
         }
         this.children.forEach(child=>{
            // Player can trample slices
            child.onCollide('player', ()=>{
               if (child.pos.y !== Y_TRAMPLED) play('burger_step', { volume: getVol(DATA_SFX_VOL) });
               child.pos.y = Y_TRAMPLED;
               if (this.isFalling) return;
               if (this.isTrampled) this.fall();
            });
            // Slices squash enemies when falling
            child.onCollide('enemy', (enemy: Enemy)=>{
               if (!this.isFalling) return;
               enemy.squash();
            });
            // Slices will bump other slices while falling
            child.onCollide('slice-bit', (sliceBit)=>{
               if (!sliceBit.isOverlapping(child)) return;
               const otherSlice = sliceBit.parent as Slice;
               if (otherSlice.isOnPlate) {
                  this.isOnPlate = true;
                  this.land();
                  this.pos = this.pos.add(0, -1);
                  return;
               }
               sliceBit.parent.fall(fallCount);
               this.pos.y-=1.5
               enemies.forEach(enemy=>enemy.pos.y-=1.5);
            });
         });
      },
      update() {
         if (!this.isFalling || this.isOnPlate) return;
         const { floor, plate } = this.calcDetectableStatus() as DetectableStatus;
         if (plate) {
            this.isOnPlate = true;
            this.land();
            return;
         }
         // If on floor and more than 6px from last floor check, then decrement
         // the floor count and land if we've run out of fall count. We check
         // this because we need to track how many levels we fall, so when we
         // hit a floor and decrement the fall count, we need to make sure to
         // not check until we've passed that floor.
         if (floor && Math.abs(fallCountY-this.pos.y)>6) {
            fallCount-=1;
            fallCountY = this.pos.y;
            if (fallCount<=0) {
               this.land();
               return;
            }
         }
         this.move(dir);
         this.enemies.forEach(enemy=>enemy.move(dir));
      },
   };
}
