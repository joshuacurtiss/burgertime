import { Comp } from 'kaboom';

type ScoreChangeCallbackFn = (score: number)=>void;

export interface ScoreComp extends Comp {
   get score(): number;
   set score(score: number);
   incScore: (inc: number)=>void;
   onScoreChange: (fn: ScoreChangeCallbackFn)=>void;
}

export function canScore(): ScoreComp {
   const scoreChangeCallbacks: ScoreChangeCallbackFn[] = [];
   let score = 0;
   return {
      id: "can-score",
      require: ["peter"],
      get score() {
         return score;
      },
      set score(newScore) {
         score = newScore;
         scoreChangeCallbacks.forEach(fn=>fn(score));
      },
      incScore(inc) {
         this.setScore(score + inc);
      },
      onScoreChange(fn) {
         scoreChangeCallbacks.push(fn);
      },
   };
};
