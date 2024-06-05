import { Comp } from 'kaboom';

export const ON_DIE = 'die';
export const ON_LIVES_CHANGE = 'livesChange';

export interface AliveComp extends Comp {
   die: Function;
   get isOutOfLives(): boolean;
   get isAlive(): boolean;
   set isAlive(bool: boolean);
   get lives(): number;
   set lives(num: number);
}

export function canAlive(): AliveComp {
   let alive=true;
   let lives=4;
   return {
      id: "can-alive",
      require: ["sprite"],
      get isOutOfLives() {
         return lives<0;
      },
      get isAlive() {
         return alive;
      },
      set isAlive(bool) {
         alive=bool;
      },
      get lives() {
         return lives;
      },
      set lives(num: number) {
         lives = num;
         this.trigger(ON_LIVES_CHANGE, num);
      },
      die() {
         if (!this.isAlive) return false;
         this.isAlive = false;
         this.lives-=1;
         this.stop();
         this.trigger(ON_DIE, this);
      },
   };
};
