import { AreaComp, Comp, EventController, GameObj, RectComp } from 'kaboom';
import { k } from '../kaboom';
import { ActionComp, isActionComp } from './Action';
import { FocusComp } from './Focus';

const { add } = k;

function isAreaComp(o: GameObj): o is GameObj<AreaComp> {
   return 'area' in o;
}

export type FocusableMenuItem = GameObj<FocusComp>;
export type ActionableMenuItem = FocusableMenuItem & GameObj<ActionComp>;
export type MenuItem = FocusableMenuItem | ActionableMenuItem;

export interface MenuComp extends Comp {
   clear: (selected?: MenuItem)=>void;
   get items(): MenuItem[];
   get focusedItem(): MenuItem | undefined;
   get keysPaused(): boolean;
   set keysPaused(bool: boolean);
}

export function addMenu(menuItems: MenuItem[]): GameObj<MenuComp> {
   return add([ menu(menuItems) ]);
}

export function menu(menuItems: MenuItem[] = []): MenuComp {
   const keyWatchers: EventController[] = [];
   return {
      id: 'menu',
      clear(selected?: MenuItem) {
         menuItems.forEach(menuItem=>{
            if (menuItem===selected || menuItem.isBlurred) return;
            menuItem.blur();
         });
      },
      get items() {
         return menuItems;
      },
      get focusedItem() {
         return menuItems.find(item=>item.isFocused);
      },
      get keysPaused() {
         return keyWatchers.every(w=>w.paused);
      },
      set keysPaused(bool: boolean) {
         keyWatchers.forEach(w=>w.paused = bool);
      },
      add() {
         keyWatchers.push(
            this.onKeyPress("up", ()=>{
               let idx = menuItems.findIndex(item=>item.isFocused) - 1;
               this.clear();
               menuItems[idx<0 ? 0 : idx].focus();
            }),
            this.onKeyPress("down", ()=>{
               let idx = menuItems.findIndex(item=>item.isFocused) + 1;
               this.clear();
               menuItems[idx>=menuItems.length ? menuItems.length-1 : idx].focus();
            }),
            this.onKeyPress("enter", ()=>{
               const menuItem = this.focusedItem;
               if (menuItem && isActionComp(menuItem)) {
                  menuItem.action();
               }
            }),
         );
         menuItems.forEach(menuItem=>{
            if (!isAreaComp(menuItem)) return;
            menuItem.onHover(()=>this.clear(menuItem));
         });
         if (menuItems[0]) menuItems[0].focus();
      },
   }
}
