import { k } from '../kaboom';
import { Comp } from 'kaboom';

const {
   anchor,
   area,
   destroy,
   lifespan,
   rand,
   sprite,
} = k;

export interface PowerupComp extends Comp {
   timeout: number,
   type: 0 | 1 | 2;
   points: ()=>number;
}

export function powerup(): PowerupComp {
   return {
      id: "powerup",
      require: ["pos"],
      timeout: 20,
      type: Math.floor(rand() * 3) as 0 | 1 | 2, // Random int between 0-2
      points: ()=>this.type*100 + Math.floor(rand()*99),
      add() {
         this.use(sprite('powerups', { frame: this.type }));
         this.use(anchor('center'));
         this.use(area({ scale: 0.6 }));
         this.use(lifespan(this.timeout));
         this.onCollide('player', player=>{
            player.salt+=1;
            destroy(this);
         });
      },
   };
}