import { Comp, GameObj } from 'kaboom';

export interface ActionComp extends Comp {
   action: Function;
};

export function isActionComp(obj: GameObj): obj is GameObj<ActionComp> {
   return obj.is('can-action');
}

export function action(actionFn: Function = ()=>{}): ActionComp {
   return {
      id: 'can-action',
      action: actionFn,
   };
};
