import { Comp, GameObj } from 'kaboom';

export interface ActionComp extends Comp {
   get action(): Function;
   set action(newFn: Function);
};

export function isActionComp(obj: GameObj): obj is GameObj<ActionComp> {
   return obj.is('can-action');
}

function wrapAction(newFn: Function, prevFn: Function): Function {
   return ()=>{
      prevFn();
      newFn();
   };
}

export function action(actionFunction: Function = ()=>{}): ActionComp {
   let actionFn: Function;
   return {
      id: 'can-action',
      get action() {
         return actionFn;
      },
      set action(newFn: Function) {
         const defaultFn = ()=>this.trigger('action', this);
         actionFn = wrapAction(newFn, defaultFn);
      },
      add() {
         this.action = actionFunction;
      },
   };
};
