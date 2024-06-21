import { k, DATA_CONTROLS, DEFAULT_CONTROLS, isGamepadButton, isKey } from '../kaboom';
import { addMenu } from '../menu/Menu';
import { addButton } from '../menu/Button';
import { addFocusableText } from '../menu/FocusableText';
import { addPeter } from '../objects/Peter';

const {
   add,
   anchor,
   color,
   getData,
   go,
   onKeyPress,
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
   const player = addPeter({ pos: vec2(width()/2, ctr.y) });
   const controls = getData(DATA_CONTROLS, DEFAULT_CONTROLS);
   let playerIndex = 0;
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
   const playerSelection = addButton({
      text: `Player ${playerIndex+1}`,
      pos: vec2(width()/2, 85),
      ...controlButtonProps,
      width: width()/2,
   });
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
   const keyPause = addButton({
      text: controls[playerIndex].pause,
      pos: vec2(190, ctr.y-10),
      ...controlButtonProps,
      width: 40,
   });
   const keyPepper = addButton({
      text: controls[playerIndex].action,
      pos: vec2(190, ctr.y+10),
      ...controlButtonProps,
      width: 40,
   });
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
   const keyUp = addButton({
      text: controls[playerIndex].up,
      pos: ctr.sub(0, 11.5),
      ...controlButtonProps,
   });
   const keyLeft = addButton({
      text: controls[playerIndex].left,
      pos: ctr.sub(15, 0),
      ...controlButtonProps,
   });
   const keyRight = addButton({
      text: controls[playerIndex].right,
      pos: ctr.add(15, 0),
      ...controlButtonProps,
   });
   const keyDown = addButton({
      text: controls[playerIndex].down,
      pos: ctr.add(0, 11.5),
      ...controlButtonProps,
   });
   const keyBlur = ()=>player.setAnim(vec2(0));
   keyDown.on('focus', ()=>player.setAnim(vec2(0, 1)));
   keyUp.on('focus', ()=>player.setAnim(vec2(0, -1)));
   keyLeft.on('focus', ()=>player.setAnim(vec2(-1, 0)));
   keyRight.on('focus', ()=>player.setAnim(vec2(1, 0)));
   keyPepper.on('focus', ()=>{
      player.throwSalt();
      player.salt+=1;
   });
   function canKeyPref() {
      let keyWatcher;
      return {
         id: 'can-key-pref',
         requires: ['button'],
         setTextSize() {
            this.textObj.textSize = this.text.length>1 ? 4 : 8;
         },
         add() {
            this.setTextSize();
            this.action = ()=>{
               this.color = rgb(80, 80, 80);
               menu.keysPaused = true;
               keyWatcher = onKeyPress((key)=>{
                  if (key==='enter') return;
                  this.text = key;
                  this.setTextSize();
                  this.blur();
                  this.focus();
               })
            };
            this.on('blur', ()=>{
               keyWatcher?.cancel();
               const keyObjects = {
                  action: keyPepper,
                  pause: keyPause,
                  left: keyLeft,
                  right: keyRight,
                  up: keyUp,
                  down: keyDown,
               };
               Object.entries(keyObjects).forEach(([key, obj])=>{
                  if (isGamepadButton(obj.text) || isKey(obj.text)) controls[playerIndex][key] = obj.text;
               });
               setData(DATA_CONTROLS, controls);
               menu.keysPaused = false;
            });
         },
      };
   }
   [keyDown, keyUp, keyLeft, keyRight, keyPause, keyPepper].forEach(kc=>{
      kc.use(canKeyPref());
      kc.on('blur', keyBlur);
   });

   const menu = addMenu([
      keyUp, keyLeft, keyRight, keyDown, keyPause, keyPepper,
      addFocusableText({
         pos: vec2(width()/2, 200),
         text: 'Back to Main Menu',
         textOpt: { size: 6 },
         action: ()=>go('start'),
      }),
   ]);
};
