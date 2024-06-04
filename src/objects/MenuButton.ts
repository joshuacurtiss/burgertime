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
   TextCompOpt,
   Vec2,
} from 'kaboom';
import { k } from '../kaboom';

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
} = k;

export type MenuButtonObj = GameObj<RectComp & AnchorComp & PosComp & AreaComp & ColorComp & MenuButtonComp>;

export interface MenuButtonComp extends Comp {
   get selected(): boolean;
   select: ()=>void;
   unselect: ()=>void;
   action: ()=>void;
}

export interface MenuButtonCompOpt {
   unselectedColor: Color;
   selectedColor: Color;
   pos: Vec2;
   width: number;
   height: number;
   text: string;
   action: ()=>void;
   rectOpt: RectCompOpt;
   textOpt: TextCompOpt;
};

const MenuButtonCompOptDefaults: MenuButtonCompOpt = {
   unselectedColor: rgb(0, 0, 0),
   selectedColor: rgb(80, 80, 80),
   pos: vec2(0),
   width: 128,
   height: 18,
   text: 'Button',
   action: ()=>{},
   rectOpt: { radius: 2 },
   textOpt: { size: 8 },
};

export function menuButton(options: Partial<MenuButtonCompOpt> = {}): MenuButtonComp {
   const opt = Object.assign({}, MenuButtonCompOptDefaults, options);
   return {
      id: 'button',
      get selected() {
         return this.color.eq(opt.selectedColor);
      },
      select() {
         this.color = opt.selectedColor;
      },
      unselect() {
         this.color = opt.unselectedColor;
      },
      action: opt.action,
      add() {
         this.onClick(this.action);
         this.onHover(()=>{
            this.select();
         });
         this.onHoverUpdate(()=>{
            setCursor('pointer');
         });
         this.add([
            anchor('center'),
            text(opt.text, opt.textOpt),
         ]);
      },
   };
}

export function addMenuButton(options: Partial<MenuButtonCompOpt> = {}) {
   const opt = Object.assign({}, MenuButtonCompOptDefaults, options);
   return add([
      rect(opt.width, opt.height, opt.rectOpt),
      anchor('center'),
      pos(opt.pos),
      area(),
      color(opt.unselectedColor),
      menuButton(opt),
   ]);
}
