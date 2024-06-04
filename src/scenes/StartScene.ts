import { k } from '../kaboom';
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
   add([
      sprite('title'),
      anchor('center'),
      pos(vec2(128, 64)),
   ])
   addMenu([
      addMenuButton({ text: '1 Player', pos: vec2(128, 120), action: ()=>{
         const players = [ addPeter() ];
         go('game', { players });
      } }),
      addMenuButton({ text: '2 Players', pos: vec2(128, 145), action: ()=>{
         const players = [ addPeter(), addPeter() ];
         go('game', { players });
      } }),
   ]);
};
