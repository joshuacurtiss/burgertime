import { Comp, GameObj } from 'kaboom';
import { k } from '../kaboom';
import { MenuButtonObj } from '../objects/MenuButton';

const {
   add,
   onKeyPress,
} = k;

export interface MenuComp extends Comp {
   clear: (selected: MenuButtonObj)=>void;
}

export function addMenu(menuItems: MenuButtonObj[]): GameObj<MenuComp> {
   return add([ menu(menuItems) ]);
}

export function menu(menuItems: MenuButtonObj[] = []): MenuComp {
   return {
      id: 'menu',
      clear(selected?: MenuButtonObj) {
         menuItems.forEach(menuItem=>{
            if (menuItem!==selected) menuItem.unselect();
         });
      },
      add() {
         onKeyPress("up", ()=>{
            let idx = menuItems.findIndex(item=>item.selected) - 1;
            this.clear();
            menuItems[idx<0 ? 0 : idx].select();
         });
         onKeyPress("down", ()=>{
            let idx = menuItems.findIndex(item=>item.selected) + 1;
            this.clear();
            menuItems[idx>=menuItems.length ? menuItems.length-1 : idx].select();
         });
         onKeyPress("enter", ()=>{
            menuItems.find(item=>item.selected)?.action();
         });
         menuItems.forEach(menuItem=>{
            menuItem.onHover(()=>{
               this.clear(menuItem);
            });
         });
         if (menuItems[0]) menuItems[0].select();
      },
   }
}
