import { k, DATA_CONTROLS, DEFAULT_CONTROLS, isGamepadButton, isKey } from '../kaboom';
import { addMenu } from '../menu/Menu';
import { addKeyPref } from '../menu/KeyPref';
import { addSelect } from '../menu/Selection';
import { addFocusableText } from '../menu/FocusableText';
import { addPeter } from '../objects/Peter';

const {
   add,
   anchor,
   color,
   getData,
   go,
   pos,
   rgb,
   setData,
   sprite,
   text,
   vec2,
   width,
   WHITE,
} = k;

export default function() {
   const ctr = vec2(50, 145);
   const controlButtonProps = { width: 14.5, height: 12, color: rgb(25, 25, 25), focusColor: rgb(50, 50, 50) };
   const controlSpriteProps = { width: 16, height: 16 };
   const controls = getData(DATA_CONTROLS, DEFAULT_CONTROLS);
   const player = addPeter({ pos: vec2(width()/2, ctr.y) });
   player.salt = 999;

   // TITLE

   add([
      sprite('title'),
      anchor('center'),
      pos(vec2(width()/2, 32)),
   ]);
   add([
      text('Controls', { size: 10 }),
      color(WHITE),
      anchor('center'),
      pos(width()/2, 65),
   ]);

   // PLAYER SELECTION

   const playerSelection = addSelect({
      pos: vec2(width()/2, 85),
      ...controlButtonProps,
      width: width()/2,
      selections: [
         { id: 0, value: 'Player 1' },
         { id: 1, value: 'Player 2' },
         { id: 2, value: 'Player 3' },
         { id: 3, value: 'Player 4' },
      ],
   });
   playerSelection.on('action', ()=>menu.keysPaused = true);
   playerSelection.on('blur', ()=>menu.keysPaused = false);
   playerSelection.on('change', idx=>{
      Object.entries(keyObjects).forEach(([key, obj])=>{
         obj.text = controls[idx][key];
         obj.autoSetText();
      });
   });

   // KEYS

   add([
      sprite('arrow-up', controlSpriteProps),
      anchor('center'),
      pos(ctr.add(0, -28.5)),
   ]);
   add([
      sprite('arrow-up', { flipY: true, ...controlSpriteProps }),
      anchor('center'),
      pos(ctr.add(0, 28.5)),
   ]);
   add([
      sprite('arrow-right', { flipX: true, ...controlSpriteProps }),
      anchor('center'),
      pos(ctr.add(-32, -0.5)),
   ]);
   add([
      sprite('arrow-right', controlSpriteProps),
      anchor('center'),
      pos(ctr.add(32, -0.5)),
   ]);
   add([
      text('Pause', { size: 8 }),
      anchor('left'),
      pos(215, ctr.y-10),
   ]);
   add([
      text('Pepper', { size: 8 }),
      anchor('left'),
      pos(215, ctr.y+10),
   ]);
   const keyPause = addKeyPref({
      text: controls[playerSelection.index].pause,
      pos: vec2(190, ctr.y-10),
      ...controlButtonProps,
      width: 40,
   });
   const keyPepper = addKeyPref({
      text: controls[playerSelection.index].action,
      pos: vec2(190, ctr.y+10),
      ...controlButtonProps,
      width: 40,
   });
   const keyUp = addKeyPref({
      text: controls[playerSelection.index].up,
      pos: ctr.sub(0, 11.5),
      ...controlButtonProps,
   });
   const keyLeft = addKeyPref({
      text: controls[playerSelection.index].left,
      pos: ctr.sub(15, 0),
      ...controlButtonProps,
   });
   const keyRight = addKeyPref({
      text: controls[playerSelection.index].right,
      pos: ctr.add(15, 0),
      ...controlButtonProps,
   });
   const keyDown = addKeyPref({
      text: controls[playerSelection.index].down,
      pos: ctr.add(0, 11.5),
      ...controlButtonProps,
   });
   keyDown.on('focus', ()=>player.setAnim(vec2(0, 1)));
   keyUp.on('focus', ()=>player.setAnim(vec2(0, -1)));
   keyLeft.on('focus', ()=>player.setAnim(vec2(-1, 0)));
   keyRight.on('focus', ()=>player.setAnim(vec2(1, 0)));
   keyPepper.on('focus', ()=>player.throwSalt());
   const keyObjects = {
      action: keyPepper,
      pause: keyPause,
      left: keyLeft,
      right: keyRight,
      up: keyUp,
      down: keyDown,
   };
   Object.values(keyObjects).forEach(kc=>{
      kc.on('blur', ()=>{
         menu.keysPaused = false;
         player.setAnim(vec2(0));
         Object.entries(keyObjects).forEach(([key, obj])=>{
            if (isGamepadButton(obj.text) || isKey(obj.text)) controls[playerSelection.index][key] = obj.text;
         });
         setData(DATA_CONTROLS, controls);
      });
      kc.on('action', ()=>{
         menu.keysPaused = true;
      });
   });

   // MENU

   const menu = addMenu([
      playerSelection,
      keyUp, keyLeft, keyRight, keyDown, keyPause, keyPepper,
      addFocusableText({
         pos: vec2(width()/2, 200),
         text: 'Back to Main Menu',
         textOpt: { size: 6 },
         action: ()=>go('start'),
      }),
   ]);
};
