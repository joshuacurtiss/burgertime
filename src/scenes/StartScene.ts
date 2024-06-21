import { AnchorComp, GameObj, TextComp } from 'kaboom';
import { k, urlParams } from '../kaboom';
import { addMenu } from '../menu/Menu';
import { addButton } from '../menu/Button';
import { addPeter } from '../objects/Peter';

const {
   add,
   anchor,
   go,
   pos,
   make,
   sprite,
   text,
   vec2,
} = k;


export default function() {
   function makeText(txt: string): GameObj<TextComp & AnchorComp> {
      return make([
         text(txt, { size: 8 }),
         anchor('center'),
      ]);
   }
   function start (length: number) {
      const players = Array.from({ length }, ()=>addPeter());
      go('game', { players });
   }
   add([
      sprite('title'),
      anchor('center'),
      pos(vec2(128, 64)),
   ])
   addMenu([
      addButton({ text: '1 Player', pos: vec2(128, 110), action: ()=>start(1) }),
      addButton({ text: '2 Players', pos: vec2(128, 130), action: ()=>start(2) }),
      addButton({ text: 'Controls', pos: vec2(128, 150), action: ()=>go('setControls') }),
      addButton({ text: 'Volume', pos: vec2(128, 170), action: ()=>go('setVolume') }),
   ]);
   // For level editing, jumps straight to desired level
   if (urlParams.has('lev')) start(1);
};
