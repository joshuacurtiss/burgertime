import {
   AnchorComp,
   AreaComp,
   Color,
   ColorComp,
   Comp,
   GameObj,
   PosComp,
   RectComp,
   RectCompOpt,
   TextComp,
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
   rgb,
   rect,
   setCursor,
   text,
   vec2,
   width,
   BLACK,
} = k;

export type Button = GameObj<RectComp & AnchorComp & PosComp & AreaComp & ColorComp & ActionComp & FocusComp & ButtonComp>;

export interface ButtonComp extends Comp {
   get text(): string;
   set text(newLabel: string);
   textObj?: GameObj<AnchorComp & TextComp>;
}

export interface ButtonCompOpt {
   color: Color;
   focusColor: Color;
   pos: Vec2;
   width: number;
   height: number;
   text: string;
   action: Function;
   rectOpt: RectCompOpt;
   textOpt: TextCompOpt;
};

export const ButtonCompOptDefaults: ButtonCompOpt = {
   color: BLACK,
   focusColor: rgb(80, 80, 80),
   pos: vec2(0),
   width: width()/2,
   height: 18,
   text: 'Button',
   action: ()=>{},
   rectOpt: { radius: 2 },
   textOpt: { size: 8 },
};

export function button(options: Partial<ButtonCompOpt> = {}): ButtonComp {
   const opt = Object.assign({}, ButtonCompOptDefaults, options);
   return {
      id: 'button',
      require: ['can-action', 'can-focus', "color"],
      get text(): string {
         return this.textObj.text;
      },
      set text(newText: string) {
         this.textObj.text = newText;
      },
      add() {
         this.textObj = this.add([
            anchor('center'),
            text(opt.text, opt.textOpt),
         ]);
         this.on('blur', ()=>this.color = opt.color);
         this.on('focus', ()=>this.color = opt.focusColor);
         this.onClick(this.action);
         this.onHover(this.focus);
         this.onHoverUpdate(()=>setCursor('pointer'));
      },
   };
}

export function addButton(options: Partial<ButtonCompOpt> = {}): Button {
   const opt = Object.assign({}, ButtonCompOptDefaults, options);
   return add([
      rect(opt.width, opt.height, opt.rectOpt),
      anchor('center'),
      pos(opt.pos),
      area(),
      color(opt.color),
      action(opt.action),
      focus(),
      button(opt),
   ]);
}
