import { Comp } from 'kaboom';

export const ON_FREEZE_CHANGE = 'freezeChange';

export interface FreezeComp extends Comp {
   freeze: Function;
   unfreeze: Function;
   get isFrozen(): boolean;
   set isFrozen(bool: boolean);
}

export function canFreeze(): FreezeComp {
   let frozen=false;
   return {
      id: "can-freeze",
      require: ["sprite"],
      get isFrozen() {
         return frozen;
      },
      set isFrozen(bool) {
         frozen = bool;
         if (frozen) this.stop();
         this.trigger(ON_FREEZE_CHANGE, frozen);
      },
      freeze() {
         this.isFrozen = true;
      },
      unfreeze() {
         this.isFrozen = false;
      },
   };
};
