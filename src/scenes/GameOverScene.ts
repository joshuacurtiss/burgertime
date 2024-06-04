import { k, BURGERTIME_BLUE } from '../kaboom';
import { GameSceneOpt } from './GameScene';

const {
   add,
   anchor,
   color,
   go,
   pos,
   text,
   vec2,
   wait,
} = k;

export default function(deadPlayer: number, opt: GameSceneOpt) {
   opt.players.forEach(p=>p.pos = vec2(-20));
   add([
      text(`Player ${deadPlayer+1} Game Over`, { size: 10 }),
      pos(k.width()/2, k.height()/2),
      color(BURGERTIME_BLUE),
      anchor('center'),
   ]);
   wait(4, ()=>go(opt.players.some(p=>p.lives>=0) ? 'game' : 'start', opt));
};
