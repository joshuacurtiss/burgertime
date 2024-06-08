import { k } from '../kaboom';
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
export const ON_SLICE_PLATE = 'slicePlate';

const Y_NORMAL = -2;
const Y_TRAMPLED = -1;
const FALL_SPEED = 55;

function isSliceBitType(num: number): num is SliceBitType {
   return num>=0 && num<4;
}

export interface SliceComp extends Comp {
   get type(): SliceType;
   get enemies(): Enemy[];
   set enemies(arr: Enemy[]);
   get isTrampled(): boolean;
   get isFalling(): boolean;
   set isFalling(bool: boolean);
   get isOnPlate(): boolean;
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
   const opt = Object.assign({}, SliceCompOptDefaults, options),
         dir = vec2(0),
         type = opt.type;
   return {
      id: "slice",
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
         enemies.forEach(enemy=>enemy.freeze());
         // if (enemies.length) play('enemy_fall');
      },
      set isOnPlate(bool) {
         const changed = onPlate===bool;
         onPlate = bool;
         if (bool && changed) this.trigger(ON_SLICE_PLATE, this);
      },
      fall() {
         if (this.isFalling || this.isOnPlate) return;
         this.pos = this.pos.add(0, 1);
         dir.y = FALL_SPEED;
         play('burger_drop');
         this.trigger(ON_SLICE_FALL, this);
      },
      land() {
         dir.y = 0;
         this.children.forEach(child=>child.pos.y = Y_NORMAL);
         enemies.forEach(enemy=>{
            if (this.isOnPlate) {
               enemy.unfreeze();
               enemy.squash();
            }
            else wait(2, ()=>{
               enemy.unfreeze();
               enemy.setDir(vec2(0));
            });
         });
         enemies = [];
      },
      add() {
         for (let bit: SliceBitType=0 ; bit<4 ; bit+=1) {
            if (isSliceBitType(bit)) this.add([
               sprite('burger', { frame: opt.type*4 + bit }),
               pos(vec2(bit*8, Y_NORMAL)),
               area({ shape: new Rect(vec2(0, 4), 8, 2) }),
               z(7),
               "slice-bit"
            ]);
         }
         this.children.forEach(child=>{
            // Player can trample slices
            child.onCollide('player', ()=>{
               child.pos.y = Y_TRAMPLED;
               play('burger_step');
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
               sliceBit.parent.fall();
            });
         });
      },
      update() {
         if (!this.isFalling || this.isOnPlate) return;
         const { floor, plate } = this.calcDetectableStatus() as DetectableStatus;
         if (plate) this.isOnPlate = true;
         if (floor || plate) {
            this.land();
            return;
         }
         this.move(dir);
         this.enemies.forEach(enemy=>enemy.move(dir));
      },
   };
}
