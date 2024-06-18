import { Color, Comp, EventController, GameObj, TextCompOpt } from 'kaboom';
import { Button, ButtonCompOpt, ButtonCompOptDefaults, addButton } from './Button';
import { k } from '../kaboom';

const {
   onKeyPress,
   rgb,
   time,
} = k;

export type KeyPref = Button & GameObj<KeyPrefComp>;

export function isKeyPrefComp(o: GameObj<any>): o is KeyPref {
   return o.is('can-key-pref');
}

export interface KeyPrefComp extends Comp {
   autoSetText: Function;
};

export interface KeyPrefCompOpt extends ButtonCompOpt {
   actionColor: Color;
   singleCharTextOpt: TextCompOpt;
   multiCharTextOpt: TextCompOpt;
}
export const KeyPrefCompOptDefaults: KeyPrefCompOpt = {
   ...ButtonCompOptDefaults,
   actionColor: rgb(80, 80, 80),
   singleCharTextOpt: { size: 8 },
   multiCharTextOpt: { size: 4 },
};

export function addKeyPref(options: Partial<KeyPrefCompOpt> = {}): KeyPref {
   const opt = Object.assign({}, KeyPrefCompOptDefaults, options);
   const btn = addButton(opt);
   btn.use(canKeyPref(opt));
   if (!isKeyPrefComp(btn)) throw new Error('Failed to create Key Pref object.');
   return btn;
}

export function canKeyPref(options: Partial<KeyPrefCompOpt> = {}): KeyPrefComp {
   const opt = Object.assign({}, KeyPrefCompOptDefaults, options);
   let keyWatcher: EventController;
   let keyWatcherTime = 0;
   return {
      id: 'can-key-pref',
      require: ['button'],
      autoSetText() {
         const textOpt = this.text.length>1 ? opt.multiCharTextOpt : opt.singleCharTextOpt;
         Object.entries(textOpt).forEach(([key, val])=>{
            if (['size', 'styles', 'transform'].includes(key)) key = 'text' + key.substring(0, 1).toUpperCase() + key.slice(1);
            this.textObj[key] = val;
         });
      },
      add() {
         this.autoSetText();
         this.action = ()=>{
            this.color = opt.actionColor;
            keyWatcherTime = time();
            keyWatcher = onKeyPress((key)=>{
               if (key==='enter' && time()-keyWatcherTime<0.5) return;
               this.text = key;
               this.autoSetText();
               this.blur();
               this.focus();
            })
         };
         this.on('blur', ()=>{
            keyWatcher?.cancel();
         });
      },
   };
}
