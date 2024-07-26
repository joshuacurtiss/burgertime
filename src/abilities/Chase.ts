import { k, DIR } from '../kaboom';
import { Comp, GameObj, PosComp, Vec2 } from 'kaboom';

const {
   dt,
   rand,
   vec2,
   RIGHT,
   LEFT,
   UP,
   DOWN,
} = k;

export interface ChaseComp extends Comp {
   get target(): GameObj;
   set target(obj: GameObj);
}

interface Intents<T> {
   up: T;
   down: T;
   left: T;
   right: T;
}

/**
 * A shuffling function; it just shuffles the array of strings.
 */
function shuffle(array: string[]): string[] {
   let currentIndex = array.length, temporaryValue, randomIndex;

   // While there remain elements to shuffle...
   while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
   }

   return array;
}

/**
 * Sorts array of strings by putting the preferred items first,
 * otherwise maintaining the same order.
 */
function sortByPref(arr: string[], pref: string[] = []): string[] {
   if (!pref.length) return [ ...arr ];
   return [
      ...arr.filter(val=>pref.includes(val)),
      ...arr.filter(val=>!pref.includes(val)),
   ];
}

/**
 * Receives an intents object with the distances to target of
 * each direction, and returns the directions by order of furthest.
 */
function sortKeysByValues(obj: Intents<number>): string[] {
   return Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
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
         const { floor, stair, stairtop } = this.calcDetectableStatus();
         stuckTime = lastPos.eq(this.pos) ? stuckTime+dt() : 0;
         lastPos = this.pos;
         if (lastThinkPos.dist(this.pos)<10 && stuckTime<0.5) return;
         if (floor) this.snap('vert');
         else if (stair || stairtop) this.snap('horiz');
         if (stuckTime || (floor && (stair || stairtop))) {
            const intents: Intents<boolean> = {
               up: this.calcIntents(UP, 'tile').stair,
               down: this.calcIntents(DOWN, 'tile').stair,
               left: this.calcIntents(LEFT, 'tile').floor,
               right: this.calcIntents(RIGHT, 'tile').floor,
            };
            lastThinkPos = this.pos;

            /**
             * This function selects which way to go based on possible intents and the target.
             * It factors in things like how close the target is, and the personality of the
             * chaser.
             *
             * Hotdog: Will almost always turn if he gets a chance, but the most sensible direction.
             * Egg:    Will try to prioritize the two furthest directions to the target.
             * Pickle: Will try to prioritize the furthest direction to the target.
             */
            const selectDirection = (intents: Intents<boolean>, target?: GameObj<PosComp>): Vec2 => {
               let newdir = vec2(0);

               // Hotdog will always prefer turning.
               const pref = this.is('hotdog') ? (this.dir.x ? ['up', 'down'] : ['left', 'right']) : [];

               // Refine preferred directions based on furthest direction for egg/pickle
               if (target && (this.is('egg') || this.is('pickle'))) {
                  // Get the distances for each direction
                  const delta: Intents<number> = {
                     up: Math.round(Math.abs(this.pos.y-target.pos.y)),
                     down: Math.round(Math.abs(this.pos.y-target.pos.y)),
                     left: Math.round(Math.abs(this.pos.x-target.pos.x)),
                     right: Math.round(Math.abs(this.pos.x-target.pos.x)),
                  };
                  // But when delta is 3+ in wrong direction, set that delta to zero
                  if (delta.up>=3 && this.pos.y<target.pos.y) delta.up=0;
                  if (delta.down>=3 && this.pos.y>target.pos.y) delta.down=0;
                  if (delta.left>=3 && this.pos.x<target.pos.x) delta.left=0;
                  if (delta.right>=3 && this.pos.x>target.pos.x) delta.right=0;

                  // Now sort the deltas. Egg/Pickle get top, but egg gets second top too.
                  // This theoretically makes his decisions a little more random.
                  const deltaRank = sortKeysByValues(delta);
                  pref.push(deltaRank[0]);
                  if (this.is('egg') && delta[deltaRank[1]]>0) pref.push(deltaRank[1]);
               }

               // Now we shuffle the four directions and sort by any preferences we just set.
               const dirs = sortByPref(shuffle(Object.keys(DIR)), pref);

               // Refine intents by disabling directions that are the wrong way from the target.
               const refinedIntents = { ...intents };
               if (target) {
                  if (this.pos.y<target.pos.y) refinedIntents.up = false;
                  if (this.pos.y>target.pos.y) refinedIntents.down = false;
                  if (this.pos.x>target.pos.x) refinedIntents.right = false;
                  if (this.pos.x<target.pos.x) refinedIntents.left = false;
               }

               // Finally, pick the first direction that can work.
               dirs.some(dir=>{
                  if (refinedIntents[dir]) newdir = DIR[dir];
                  return !newdir.isZero();
               });

               // Lastly, if we were using a target and that caused us to just fail to find a
               // direction, than try again with no target, to just pick any available direction.
               if (target && newdir.isZero()) newdir = selectDirection(intents);
               return newdir;
            }

            // Assign values for how much change that the enemy will be smart, which means
            // they'll actually chase the target, versus just going an available direction.
            const smartChance = this.is('hotdog') ? 50 : this.is('egg') ? 66 : 99;
            const smart = rand(100)<smartChance;
            const newdir = selectDirection(intents, smart ? target : undefined);

            this.setIntendedDir(newdir);
         }
      },
   };
};
