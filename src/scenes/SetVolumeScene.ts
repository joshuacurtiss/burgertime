import { Key } from 'kaboom';
import { k, getVol, DATA_MUSIC_VOL, DATA_SFX_VOL, DEFAULT_VOL } from '../kaboom';
import { addMenu } from '../menu/Menu';
import { addSlider, isSliderComp } from '../menu/Slider';
import { addFocusableText } from '../menu/FocusableText';

const {
   add,
   anchor,
   color,
   getData,
   go,
   onKeyPress,
   onSceneLeave,
   play,
   pos,
   setData,
   sprite,
   text,
   vec2,
   WHITE,
   width,
} = k;

export default function() {
   const music = play('music', { loop: true, volume: getVol(DATA_MUSIC_VOL) });
   // Title
   add([
      sprite('title'),
      anchor('center'),
      pos(vec2(width()/2, 32)),
   ]);
   add([
      text('Volume Preferences', { size: 10 }),
      color(WHITE),
      anchor('center'),
      pos(width()/2, 76),
   ]);
   // Icons
   add([
      sprite('audio-speaker', { width: 16, height: 16 }),
      pos(width()/8, 96),
   ]);
   add([
      sprite('music-note', { width: 16, height: 16 }),
      pos(width()/8, 128),
   ]);
   const menu = addMenu([
      // Sliders
      addSlider({
         pos: vec2(width()/4, 100),
         width: width()/2,
         height: 8,
         textOptions: { size: 6 },
         value: getData(DATA_SFX_VOL, DEFAULT_VOL),
         valueSuffix: '%',
      }),
      addSlider({
         pos: vec2(width()/4, 132),
         width: width()/2,
         height: 8,
         textOptions: { size: 6 },
         value: getData(DATA_MUSIC_VOL, DEFAULT_VOL),
         valueSuffix: '%',
      }),
      addFocusableText({
         pos: vec2(width()/2, 164),
         text: 'Back to Main Menu',
         textOpt: { size: 6 },
         action: ()=>go('start'),
      }),
   ]);
   menu.items[0].use(DATA_SFX_VOL);
   menu.items[1].use(DATA_MUSIC_VOL);
   // Controls
   const changeLevel = (key: Key) => {
      const item = menu.focusedItem;
      if (!item) return;
      if (!isSliderComp(item)) return;
      item.value += key==='left' ? -5 : 5;
      const isMusicKey = item.is(DATA_MUSIC_VOL);
      setData(isMusicKey ? DATA_MUSIC_VOL : DATA_SFX_VOL, item.value);
      if (isMusicKey) music.volume = item.value/100;
      else play('enemy_squash', { volume: getVol(DATA_SFX_VOL) });
   };
   onKeyPress('left', changeLevel);
   onKeyPress('right', changeLevel);
   onSceneLeave(()=>music.stop());
};
