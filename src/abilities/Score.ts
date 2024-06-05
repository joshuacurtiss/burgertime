import { Comp } from 'kaboom';

export const ON_SCORE_CHANGE = 'scoreChange';

export interface ScoreComp extends Comp {
   get score(): number;
   set score(score: number);
   incScore: (inc: number)=>void;
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
         score = newScore;
         this.trigger(ON_SCORE_CHANGE, score);
      },
      incScore(inc) {
         this.setScore(score + inc);
      },
   };
};
