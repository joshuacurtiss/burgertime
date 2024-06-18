import { AnchorComp, Color, ColorComp, Comp, GameObj, PosComp, RectComp, RectCompOpt, TextComp, TextCompOpt, Vec2 } from 'kaboom';
import { k } from '../kaboom';
import { FocusComp, focus } from './Focus';

const {
   add,
   anchor,
   area,
   color,
   pos,
   rect,
   setCursor,
   text,
   vec2,
   BLACK,
   WHITE,
   YELLOW,
} = k;

export type Slider = GameObj<RectComp & PosComp & ColorComp & FocusComp & SliderComp>;

export interface SliderCompOpt {
   border: number;
   textOptions: TextCompOpt;
   rectOptions: RectCompOpt;
   fontColor: Color;
   showValue: boolean;
   valuePrefix: string;
   valueSuffix: string;
   color: Color;
   focusColor: Color;
   min: number;
   max: number;
   width: number;
   height: number;
   pos: Vec2;
   value: number;
};

const SliderCompOptDefaults: SliderCompOpt = {
   border: 1,
   textOptions: { size: 8 },
   rectOptions: {},
   fontColor: WHITE,
   showValue: true,
   valuePrefix: '',
   valueSuffix: '',
   color: WHITE,
   focusColor: YELLOW,
   min: 0,
   max: 100,
   width: 100,
   height: 8,
   pos: vec2(0),
   value: 0,
};

export interface SliderComp extends Comp {
   get value(): number;
   set value(val: number);
};

export function isSliderComp(obj: GameObj): obj is GameObj<SliderComp> {
   return obj.is('slider');
}

export function addSlider(options: Partial<SliderCompOpt> = {}): Slider {
   const opt: SliderCompOpt = Object.assign({}, SliderCompOptDefaults, options);
   return add([
      rect(opt.width, opt.height, opt.rectOptions),
      area(),
      color(opt.color),
      pos(opt.pos),
      focus(),
      slider(opt.value, opt),
   ]);
};

export function slider(value: number = 0, options: Partial<SliderCompOpt> = {}): SliderComp {
   const opt: SliderCompOpt = Object.assign({}, SliderCompOptDefaults, options);
   let val = value;
   let sliderRect: GameObj<RectComp & AnchorComp & PosComp & ColorComp>;
   let sliderText: GameObj<TextComp & AnchorComp & PosComp & ColorComp>;
   return {
      id: 'slider',
      require: ['rect', 'color', 'pos'],
      get value() {
         return val;
      },
      set value(newval: number) {
         val = newval<opt.min ? opt.min : newval>opt.max ? opt.max : newval;
         if (sliderText) sliderText.text = opt.valuePrefix + val.toLocaleString() + opt.valueSuffix;
         sliderRect.width = (this.width-opt.border*2) * (opt.max-val) / opt.max;
      },
      add() {
         this.on('blur', ()=>this.color = opt.color);
         this.on('focus', ()=>this.color = opt.focusColor);
         this.onHover(this.focus);
         this.onHoverUpdate(()=>setCursor('pointer'));
         if( opt.showValue ) sliderText = this.add([
               text('', opt.textOptions),
               anchor('left'),
               pos(this.width+20, this.height/2),
               color(opt.fontColor),
         ]);
         sliderRect = this.add([
               rect(0, this.height-opt.border*2),
               pos(this.width-opt.border, opt.border),
               anchor('topright'),
               color(BLACK),
         ]);
         this.value = val;
      },
   };
};
