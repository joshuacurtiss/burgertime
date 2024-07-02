import { Comp, GameObj } from 'kaboom';

export interface FocusComp extends Comp {
   get isBlurred(): boolean;
   get isFocused(): boolean;
   blur: Function;
   focus: Function;
};

export function isFocusComp(obj: GameObj): obj is GameObj<FocusComp> {
   return obj.is('can-focus');
}

export function focus(): FocusComp {
   let foc = false;
   return {
      id: 'can-focus',
      get isFocused() {
         return foc;
      },
      get isBlurred() {
         return !foc;
      },
      focus() {
         foc = true;
         this.trigger('focus')
      },
      blur() {
         foc = false;
         this.trigger('blur')
      },
   };
};
