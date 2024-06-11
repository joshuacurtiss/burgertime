import { k, urlParams } from '../kaboom';
import { addMenu } from '../objects/Menu';
import { addMenuButton } from '../objects/MenuButton';
import { addPeter } from '../objects/Peter';

const {
   add,
   anchor,
   go,
   pos,
   sprite,
   vec2,
} = k;

export default function() {
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
      addMenuButton({ text: '1 Player', pos: vec2(128, 120), action: ()=>start(1) }),
      addMenuButton({ text: '2 Players', pos: vec2(128, 145), action: ()=>start(2) }),
   ]);
   // For level editing, jumps straight to desired level
   if (urlParams.has('lev')) start(1);
};
