import { Comp, EventController, GameObj, TextCompOpt } from 'kaboom';
import { Button, ButtonCompOpt, ButtonCompOptDefaults, addButton } from './Button';
import { k } from '../kaboom';

const {
   anchor,
   onKeyPress,
   pos,
   rgb,
   text,
   time,
} = k;

export type Selection = Button & GameObj<SelectionComp>;

export function isSelectionComp(o: GameObj<any>): o is Selection {
   return o.is('can-select');
};

export interface SelectionItem {
   id: number;
   value: string;
};

export interface SelectionComp extends Comp {
   get index(): number;
   set index(val: number);
   get values(): SelectionItem[];
   set values(selections: SelectionItem[]);
};

export interface SelectionCompOpt extends ButtonCompOpt {
   selectionArrowTextOpt: TextCompOpt;
   selections: SelectionItem[];
}
export const SelectionCompOptDefaults: SelectionCompOpt = {
   ...ButtonCompOptDefaults,
   selectionArrowTextOpt: { size: 10 },
   selections: [],
};

export function addSelect(options: Partial<SelectionCompOpt> = {}): Selection {
   const opt = Object.assign({}, SelectionCompOptDefaults, options);
   const sel = addButton(opt);
   sel.use(canSelect(opt));
   if (!isSelectionComp(sel)) throw new Error('Failed to create selection object.');
   return sel;
}

export function canSelect(options: Partial<SelectionCompOpt> = {}): SelectionComp {
   const opt = Object.assign({}, SelectionCompOptDefaults, options);
   let index = 0;
   let vals: SelectionItem[] = opt.selections;
   let keyWatcher: EventController;
   let keyWatcherTime = 0;
   return {
      id: 'can-select',
      require: ['button', 'can-action'],
      get index() {
         return index;
      },
      set index(val: number) {
         index = val>=vals.length ? 0 : val<0 ? vals.length-1 : val;
         this.text = vals[index].value;
         this.trigger('change', index, vals[index]);
      },
      get values() {
         return vals;
      },
      set values(selections: SelectionItem[]) {
         vals = selections;
      },
      add() {
         this.text = vals[index].value;
         this.add([
            text('﹤', opt.selectionArrowTextOpt),
            anchor('left'),
            pos(-this.width/2, this.height/12),
         ]);
         this.add([
            text('﹥', opt.selectionArrowTextOpt),
            pos(this.width/2, this.height/12),
            anchor('right'),
         ]);
         this.action = ()=>{
            this.color = rgb(80, 80, 80);
            keyWatcherTime = time();
            keyWatcher = onKeyPress((key)=>{
               if (key==='enter' && time()-keyWatcherTime>0.5) {
                  this.blur();
                  this.focus();
               } else if (key==='right') {
                  this.index+=1;
               } else if (key==='left') {
                  this.index-=1;
               }
            })
         };
         this.on('blur', ()=>{
            keyWatcher?.cancel();
         });
      }
   };
};
