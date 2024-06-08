import { k } from '../kaboom';
import { Comp, GameObj, PosComp } from 'kaboom';

const {
   dt,
   rand,
   vec2,
} = k;

export interface ChaseComp extends Comp {
   get target(): GameObj;
   set target(obj: GameObj);
}

export function canChase(): ChaseComp {
   let target: GameObj<PosComp>;
   let lastThinkPos = vec2(0);
   let lastPos = vec2(0);
   let stuckTime = 0;
   return {
      id: "can-chase",
      require: ["can-alive", "can-detect", "can-freeze", "can-walk"],
      get target() {
         return target;
      },
      set target(obj) {
         target = obj;
      },
      update() {
         if (this.isFrozen || !this.isAlive) return;
         if (!target) return;
         stuckTime = lastPos.eq(this.pos) ? stuckTime+dt() : 0;
         lastPos = this.pos;
         if (lastThinkPos.dist(this.pos)<10 && stuckTime<0.5) return;
         const { floor, stair, stairtop } = this.calcDetectableStatus();
         if (stuckTime || (floor && (stair || stairtop))) {
            lastThinkPos = this.pos;
            let newdir = vec2(0);
            if (rand(100)<75) {
               if (this.dir.x) {
                  const newdirY = target.pos.y>this.pos.y ? 1 : -1;
                  newdir = this.restrictDir(vec2(0, newdirY))
                  if (newdir.isZero()) newdir = vec2(0, -newdirY);
               } else {
                  const newdirX = target.pos.x>this.pos.x ? 1 : -1;
                  newdir = this.restrictDir(vec2(newdirX, 0))
                  if (newdir.isZero()) newdir = vec2(-newdirX, 0);
               }
               this.setIntendedDir(newdir);
            }
         }
      },
   };
};
