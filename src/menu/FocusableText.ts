import {
   AnchorComp,
   AreaComp,
   Color,
   ColorComp,
   Comp,
   GameObj,
   PosComp,
   TextCompOpt,
   Vec2,
} from 'kaboom';
import { k } from '../kaboom';
import { ActionComp, action } from './Action';
import { FocusComp, focus } from './Focus';

const {
   add,
   anchor,
   area,
   color,
   pos,
   setCursor,
   text,
   vec2,
   WHITE,
   YELLOW,
} = k;

export type FocusableText = GameObj<AnchorComp & AreaComp & PosComp & ColorComp & ActionComp & FocusComp>;

export interface FocusableTextCompOpt {
   color: Color;
   focusColor: Color;
   pos: Vec2;
   text: string;
   action: Function;
   textOpt: TextCompOpt;
};

const FocusableTextCompOptDefaults: FocusableTextCompOpt = {
   color: WHITE,
   focusColor: YELLOW,
   pos: vec2(0),
   text: 'Text',
   action: ()=>{},
   textOpt: { size: 8 },
};

export interface FocusableTextComp extends Comp {
   get focusableText(): string;
   set focusableText(newval: string);
}

export function focusableText(options: Partial<FocusableTextCompOpt> = {}): FocusableTextComp {
   const opt = Object.assign({}, FocusableTextCompOptDefaults, options);
   return {
      id: 'focusable-text',
      require: ['can-action', 'can-focus', "color"],
      get focusableText() {
         return this.text;
      },
      set focusableText(newval) {
         this.text = newval;
      },
      add() {
         this.on('blur', ()=>this.color = opt.color);
         this.on('focus', ()=>this.color = opt.focusColor);
         this.onClick(this.action);
         this.onHover(this.focus);
         this.onHoverUpdate(()=>setCursor('pointer'));
      },
   };
}

export function addFocusableText(options: Partial<FocusableTextCompOpt> = {}): FocusableText {
   const opt = Object.assign({}, FocusableTextCompOptDefaults, options);
   return add([
      text(opt.text, opt.textOpt),
      anchor('center'),
      pos(opt.pos),
      area(),
      color(opt.color),
      action(opt.action),
      focus(),
      focusableText(opt),
   ]);
}
