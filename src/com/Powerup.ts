import { k } from '../kaboom';
import { Comp } from 'kaboom';

const {
   add,
   anchor,
   area,
   color,
   destroy,
   lifespan,
   pos,
   rand,
   sprite,
   text,
   z,
} = k;

export interface PowerupComp extends Comp {
   timeout: number,
   type: 0 | 1 | 2;
   get points(): number;
}

export function powerup(): PowerupComp {
   const pointsRandomness = Math.floor(rand()*99);
   return {
      id: "powerup",
      require: ["pos"],
      timeout: 20,
      type: Math.floor(rand() * 3) as 0 | 1 | 2, // Random int between 0-2
      get points() {
         return (this.type+1)*100 + pointsRandomness;
      },
      add() {
         this.use(sprite('powerups', { frame: this.type }));
         this.use(anchor('center'));
         this.use(area({ scale: 0.6 }));
         this.use(lifespan(this.timeout));
         this.onCollide('player', player=>{
            player.salt+=1;
            player.score+=this.points;
            const scoreIndicator = add([
               text(this.points, { align: 'center', size: 5 }),
               color(254, 147, 11),
               anchor('center'),
               pos(this.pos),
               lifespan(2, { fade: 0.5 }),
               z(999),
            ])
            scoreIndicator.onUpdate(()=>{
               scoreIndicator.move(0, -3);
            });
            destroy(this);
         });
      },
   };
}