import { k, getVol, DATA_SFX_VOL } from '../kaboom';
import { Comp } from 'kaboom';

const { play } = k;

export const ON_SCORE_CHANGE = 'scoreChange';

const NEW_LIFE_SCORE_THRESHOLD = 20000;

export interface ScoreComp extends Comp {
   get score(): number;
   set score(score: number);
}

export function canScore(): ScoreComp {
   let score = 0;
   return {
      id: "can-score",
      require: ["peter"],
      get score() {
         return score;
      },
      set score(newScore) {
         if (score % NEW_LIFE_SCORE_THRESHOLD > newScore % NEW_LIFE_SCORE_THRESHOLD) {
            play('powerup', { volume: getVol(DATA_SFX_VOL) });
            this.lives+=1;
         }
         score = newScore;
         this.trigger(ON_SCORE_CHANGE, score);
      },
   };
};
