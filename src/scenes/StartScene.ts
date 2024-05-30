import { k } from '../kaboom';

const {
   add,
   anchor,
   color,
   go,
   onKeyRelease,
   pos,
   text,
   vec2,
} = k;

export default function() {
   add([
      text("Press enter to start", { size: 12 }),
      pos(vec2(128, 120)),
      anchor("center"),
      color(255, 255, 255),
   ]);

   onKeyRelease("enter", ()=>go("game"));
   onKeyRelease("space", ()=>go("game"));
};
