import { Vec2 } from 'kaboom';
import { EnemyCompOpt } from './Enemy';
import { PeterCompOpt } from './Peter';
import { PowerupCompOpt } from './Powerup';
import { SliceCompOpt } from './Slice';
import { k } from '../kaboom';

const { vec2 } = k;

interface BurgerDefinition {
   type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
   pos: Vec2;
};

interface LevelDefinition {
   map: string[];
   powerup: Partial<PowerupCompOpt>
   player: Partial<PeterCompOpt>;
   multiplayer: Partial<PeterCompOpt>[];
   enemies: Partial<EnemyCompOpt>[];
   slices: Partial<SliceCompOpt>[];
};

/**
 *  Player and Enemies: +5 on y-axis from multiple of 8.
 *  Powerup: +4 on y-axis from multiple of 8.
 *  Slices: Exact multiples of 8.
 */

export const levels: LevelDefinition[] = [
   {
      map: [
         '                                ',
         '                                ',
         '                                ',
         '   __________________________   ',
         '   ||    || || ||    ||    ||   ',
         '   ||    || || ||    ||    ||   ',
         '   ||    || || ||    ||    ||   ',
         '   !!____!! || !!____!!____!!   ',
         '      || || || || || ||    ||   ',
         '      || !!_!!_!! || ||    ||   ',
         '      || ||    || || ||    ||   ',
         '   ___!!_!!    || || !!____!!   ',
         '   || || ||    || || || ||      ',
         '   || || !!____!!_!!_!! ||      ',
         '   || || ||    ||    || ||      ',
         '   || || ||    ||    !!_!!___   ',
         '   || || ||    ||    || || ||   ',
         '   !!_!!_!!____!!____!! || ||   ',
         '   ||    ||    ||    || || ||   ',
         '   ||    ||    ||    || || ||   ',
         '   ||    ||    ||    || || ||   ',
         '   !!____!!____!!____!!_!!_!!   ',
         '                                ',
         '                                ',
         '                                ',
         '    (----)(----)(----)(----)    ',
         '                                ',
      ],
      powerup: { type: 0, pos: vec2(128, 100) },
      player: { pos: vec2(128, 165) },
      multiplayer: [
         { pos: vec2(112, 165) },
         { pos: vec2(144, 165) },
      ],
      enemies: [
         { type: 'hotdog', pos: vec2(224, 165) },
         { type: 'egg', pos: vec2(32, 165) },
         { type: 'hotdog', pos: vec2(32, 21) },
         { type: 'hotdog', pos: vec2(224, 21) },
         { type: 'hotdog', pos: vec2(64, 21) },
      ],
      slices: [
         { type: 0, pos: vec2(40, 56) },
         { type: 6, pos: vec2(40, 88) },
         { type: 4, pos: vec2(40, 136) },
         { type: 1, pos: vec2(40, 168) },

         { type: 0, pos: vec2(88, 24) },
         { type: 6, pos: vec2(88, 104) },
         { type: 4, pos: vec2(88, 136) },
         { type: 1, pos: vec2(88, 168) },

         { type: 0, pos: vec2(136, 24) },
         { type: 6, pos: vec2(136, 56) },
         { type: 4, pos: vec2(136, 104) },
         { type: 1, pos: vec2(136, 168) },

         { type: 0, pos: vec2(184, 24) },
         { type: 6, pos: vec2(184, 56) },
         { type: 4, pos: vec2(184, 88) },
         { type: 1, pos: vec2(184, 120) },
      ],
   },
   {
      map: [
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '                                ',
         '   ________          ________   ',
         '   || ||                ||      ',
         '   || || ______________ ||      ',
         '   || || ||    ||    || ||      ',
         '   || || ||    ||    !!_!!___   ',
         '   || || ||    ||    || || ||   ',
         '   !!_!!_!!____!!____!! || ||   ',
         '   ||    ||    ||    || || ||   ',
         '   ||    ||    ||    || || ||   ',
         '   ||    ||    ||    || || ||   ',
         '   !!____!!____!!____!!_!!_!!   ',
         '                                ',
         '                                ',
         '                                ',
         '    (----)(----)(----)(----)    ',
         '                                ',
      ],
      powerup: { type: 1, pos: vec2(128, 100) },
      player: { pos: vec2(128, 165) },
      multiplayer: [
         { pos: vec2(112, 165) },
         { pos: vec2(144, 165) },
      ],
      enemies: [
         { type: 'hotdog', pos: vec2(224, 165) },
         { type: 'egg', pos: vec2(32, 165) },
         { type: 'hotdog', pos: vec2(32, 85) },
         { type: 'hotdog', pos: vec2(224, 117) },
         { type: 'hotdog', pos: vec2(96, 101) },
      ],
      slices: [
         { type: 0, pos: vec2(40, 88) },
         { type: 4, pos: vec2(40, 136) },
         { type: 1, pos: vec2(40, 168) },

         { type: 0, pos: vec2(88, 104) },
         { type: 5, pos: vec2(88, 136) },
         { type: 1, pos: vec2(88, 168) },

         { type: 0, pos: vec2(136, 104) },
         { type: 5, pos: vec2(136, 136) },
         { type: 1, pos: vec2(136, 168) },

         { type: 0, pos: vec2(184, 88) },
         { type: 4, pos: vec2(184, 120) },
         { type: 1, pos: vec2(184, 168) },
      ],
   },
];
