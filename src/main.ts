import kaboom, {
   AnchorComp,
   CircleComp,
   ColorComp,
   Comp,
   GameObj,
   KaboomCtx,
   LevelOpt,
   PosComp,
   SpriteComp,
   TextComp,
   TileComp,
   Vec2,
} from "kaboom";

const k: KaboomCtx = kaboom({
   background: [0, 0, 0],
   width: 256,
   height: 224,
   scale: 3,
});

const {
   loadRoot,
   loadSprite,
   isKeyDown,
   onKeyRelease,
   add,
   addLevel,
   anchor,
   area,
   circle,
   color,
   debug,
   fixed,
   go,
   lifespan,
   pos,
   Rect,
   RED,
   scene,
   sprite,
   text,
   WHITE,
   vec2,
   z,
} = k;

const LEVELS = [
   [
      "                                ",
      "                                ",
      "                                ",
      "                                ",
      "   __________________________   ",
      "   ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉   ",
      "   ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉   ",
      "   ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉   ",
      "   ⌋⌊____⌋⌊ ⌈⌉ ⌋⌊____⌋⌊____⌋⌊   ",
      "      ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉   ",
      "      ⌈⌉ ⌋⌊_⌋⌊_⌋⌊ ⌈⌉ ⌈⌉    ⌈⌉   ",
      "      ⌈⌉ ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉   ",
      "   ___⌋⌊_⌋⌊    ⌈⌉ ⌈⌉ ⌋⌊____⌋⌊   ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉ ⌈⌉      ",
      "   ⌈⌉ ⌈⌉ ⌋⌊____⌋⌊_⌋⌊_⌋⌊ ⌈⌉      ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉      ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌋⌊_⌋⌊___   ",
      "   ⌈⌉ ⌈⌉ ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌋⌊_⌋⌊_⌋⌊____⌋⌊____⌋⌊ ⌈⌉ ⌈⌉   ",
      "   ⌈⌉    ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌈⌉    ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌈⌉    ⌈⌉    ⌈⌉    ⌈⌉ ⌈⌉ ⌈⌉   ",
      "   ⌋⌊____⌋⌊____⌋⌊____⌋⌊_⌋⌊_⌋⌊   ",
      "                                ",
      "                                ",
      "                                ",
      "    (⎽⎽⎽⎽)(⎽⎽⎽⎽)(⎽⎽⎽⎽)(⎽⎽⎽⎽)    ",
   ],
];

loadRoot("sprites/");
loadSprite("burger", "burger.png", { sliceX: 28 });
loadSprite("enemies", "enemies.png", {
   sliceX: 12,
   sliceY: 3,
   anims: {
      'hotdog-walk': { from: 1, to: 2, loop: true, speed: 8 },
      'hotdog-down': { from: 3, to: 4, loop: true, speed: 8 },
      'hotdog-up': { from: 5, to: 6, loop: true, speed: 8 },
      'hotdog-squash': { from: 7, to: 10, speed: 12 },
      'hotdog-stun': { from: 11, to: 12, loop: true, speed: 1 },
      'pickle-walk': { from: 13, to: 14, loop: true, speed: 8 },
      'pickle-down': { from: 15, to: 16, loop: true, speed: 8 },
      'pickle-up': { from: 17, to: 18, loop: true, speed: 8 },
      'pickle-squash': { from: 19, to: 22, speed: 12 },
      'pickle-stun': { from: 23, to: 24, loop: true, speed: 1 },
      'egg-walk': { from: 25, to: 26, loop: true, speed: 8 },
      'egg-down': { from: 27, to: 28, loop: true, speed: 8 },
      'egg-up': { from: 29, to: 30, loop: true, speed: 8 },
      'egg-squash': { from: 31, to: 34, speed: 12 },
      'egg-stun': { from: 35, to: 36, loop: true, speed: 1 },
   },
});
loadSprite("peter", "peter.png", {
   sliceX: 19,
   anims: {
      idle: { from: 7, to: 7, loop: true, speed: 1 },
      walk: { from: 0, to: 2, loop: true, speed: 24 },
      down: { from: 3, to: 4, loop: true, speed: 24 },
      up: { from: 5, to: 6, loop: true, speed: 24 },
      'throw': { from: 9, to: 9, speed: 2 },
      'throw-down': { from: 10, to: 10, speed: 2 },
      'throw-up': { from: 11, to: 11, speed: 2 },
      celebrate: { from: 13, to: 13, speed: 1 },
      fall: { from: 14, to: 18, speed: 20 },
      dead: { from: 17, to: 18, loop: true, speed: 10 }
   },
});
loadSprite("floor", "floor.png", { sliceX: 2 });
loadSprite("floor-stair-blue", "floor-stair-blue.png", { sliceX: 2 });
loadSprite("floor-stair-green", "floor-stair-green.png", { sliceX: 2 });
loadSprite("head-h", "head-h.png");
loadSprite("head-p", "head-p.png");
loadSprite("plate", "plate.png", { sliceX: 2 });
loadSprite("salt", "salt.png", { sliceX: 4 });
loadSprite("stair-blue", "stair-blue.png", { sliceX: 2 });
loadSprite("stair-green", "stair-green.png", { sliceX: 2 });

interface PeterComp extends Comp {
   isFrozen: boolean;
   isAlive: boolean;
   freeze: Function;
   die: Function;
}

function peter(): PeterComp {
   return {
      id: "peter",
      require: ["area", "sprite", "can-walk"],
      isFrozen: false,
      isAlive: true,
      add() {
         onKeyRelease('up', ()=>this.snap('vert'));
         onKeyRelease('down', ()=>this.snap('vert'));
         onKeyRelease('left', ()=>this.snap('horiz'));
         onKeyRelease('right', ()=>this.snap('horiz'));
      },
      update() {
         if (this.isFrozen) {
            return;
         }
         let anim = 'idle';
         let dir = vec2(0);
         let flipX = false;
         if (isKeyDown("up")) {
            anim = 'up';
            dir = dir.add(0, -1);
         }
         if (isKeyDown("down")) {
            anim = 'down';
            dir = dir.add(0, 1);
         }
         if (isKeyDown("left")) {
            anim = 'walk';
            dir = dir.add(-1, 0);
         }
         if (isKeyDown("right")) {
            anim = 'walk';
            dir = dir.add(1, 0);
            flipX = true;
         }
         this.dir = dir;
         this.flipX = flipX;
         if (this.curAnim() !== anim) this.play(anim);
      },
      freeze() {
         this.isFrozen = true;
      },
      die() {
         this.unuse("body");
         this.isAlive = false;
         this.use(lifespan(1, { fade: 1 }));
      },
   };
}

type WalkableObj = GameObj<PosComp & TileComp & SpriteComp & AnchorComp>;

interface WalkComp extends Comp {
   dir: Vec2;
   onFloor: boolean;
   onStair: boolean;
   speed: number;
   stairSpeedMultiplier: number;
   calcIntendedLocation: () => void;
   calcWalkableStatus: () => void;
   setObjects: (obj: { floors: WalkableObj[], stairs: WalkableObj[], stairtops: WalkableObj[] }) => void;
   snap: (orientation: 'horiz' | 'vert') => void;
}

function canWalk(): WalkComp {
   let intendedLocation: GameObj<PosComp & CircleComp & AnchorComp>;
   let txtPos: GameObj<PosComp & TextComp & ColorComp>;
   let txtFloor: GameObj<PosComp & TextComp & ColorComp>;
   let txtStair: GameObj<PosComp & TextComp & ColorComp>;
   let floors: WalkableObj[];
   let stairs: WalkableObj[];
   let stairtops: WalkableObj[];

   function withinFloor(obj: WalkableObj, pos: Vec2) {
      if (Math.abs(pos.y-obj.pos.y)>1.75) return false;
      return pos.x>=obj.pos.x && pos.x<=obj.pos.x+obj.width;
   }

   function withinStairs(obj: WalkableObj, pos: Vec2) {
      if (obj.is('stairleft')) {
         if (pos.x<obj.pos.x+5 || pos.x>obj.pos.x+obj.width) return false;
      } else {
         if (pos.x<obj.pos.x || pos.x>obj.pos.x+obj.width-5) return false;
      }
      return pos.y>=obj.pos.y && pos.y<=obj.pos.y+obj.height;
   }

   function withinStairtops(obj: WalkableObj, pos: Vec2) {
      if (obj.is('stairleft')) {
         if (pos.x<obj.pos.x+5 || pos.x>obj.pos.x+obj.width) return false;
      } else {
         if (pos.x<obj.pos.x || pos.x>obj.pos.x+obj.width-5) return false;
      }
      return pos.y>=obj.pos.y+obj.height/2 && pos.y<=obj.pos.y+obj.height;
   }

   function within(objs: WalkableObj[], pos: Vec2, method: (obj: WalkableObj, pos: Vec2)=>boolean) {
      return objs.some(obj=>method(obj, pos));
   }

   return {
      id: 'can-walk',
      require: ["sprite"],
      dir: vec2(0),
      speed: 55,
      stairSpeedMultiplier: 0.7,
      onFloor: false,
      onStair: false,
      add() {
         intendedLocation = add([
            pos(),
            circle(1),
            anchor('center'),
         ]);
         intendedLocation.hidden = !debug.inspect;
         if (debug.inspect) {
            txtFloor = add([
               text('Floor', { size: 5 }),
               pos(40, 5.5),
               color(WHITE),
            ]);
            txtStair = add([
               text('Stair', { size: 5 }),
               pos(65, 5.5),
               color(WHITE),
            ]);
            txtPos = add([
               text('', { size: 5 }),
               pos(90, 5.5),
               color(WHITE),
            ]);
         }
      },
      setObjects(obj) {
         floors = obj.floors;
         stairs = obj.stairs;
         stairtops = obj.stairtops;
      },
      calcWalkableStatus() {
         this.onFloor = within(floors, this.pos.add(0, 3), withinFloor);
         this.onStair = within(stairs, this.pos.add(0, 8), withinStairs);
      },
      calcIntendedLocation() {
         intendedLocation.pos = this.pos.add(0, this.area.shape.height/2).add(this.dir.x * this.area.shape.width/1.5, this.dir.y<=0 ? this.dir.y : 3.75);
      },
      snap(orientation) {
         this.calcWalkableStatus();
         if (orientation==='vert' && this.onFloor) {
            let y: number = this.pos.y;
            const mod = -(y % 8 - 5);
            this.moveTo(this.pos.add(0, mod));
         } else if (orientation==='horiz' && this.onStair) {
            let mod = -(this.pos.x % 8);
            if (Math.abs(mod)>4) mod+=8;
            this.moveTo(this.pos.add(mod, 0));
         }
      },
      update() {
         // Determine location status (on floor or stair)
         this.calcWalkableStatus();
         // Make movement corrections based on restrictions
         this.calcIntendedLocation();
         if (this.dir.x) {
            const intendedOnFloor = within(floors, intendedLocation.pos.add(0, -4.5), withinFloor);
            if (!this.onFloor || !intendedOnFloor ) {
               this.dir.x=0;
               this.calcIntendedLocation();
            }
         }
         if (this.dir.y) {
            const intendedOnStairs = within(stairs, intendedLocation.pos, withinStairs);
            const intendedOnStairtop = within(stairtops, intendedLocation.pos, withinStairtops);
            const onStairtop = within(stairtops, this.pos.add(0, 8), withinStairtops);
            if (this.onFloor && intendedOnStairs) {
               // Okay, you're getting on stairs from the floor
            } else if (onStairtop && intendedOnStairs) {
               // Or, you're on the stairtop trying to walk on stairs.
            } else if (intendedOnStairtop) {
               // Also okay, you're walking toward stairtops
            } else if (!this.onStair || !intendedOnStairs) {
               this.dir.y=0;
               this.calcIntendedLocation();
            }
         }
         // Move
         if (!this.dir.isZero()) {
            this.move((this.dir as Vec2).scale(this.dir.y ? this.speed * this.stairSpeedMultiplier : this.speed));
         }
         // Update debugging dashboard
         if (debug.inspect) {
            txtPos.text = `${this.pos.x.toFixed(2)}, ${this.pos.y.toFixed(2)}`;
            txtStair.color = this.onStair ? RED : WHITE;
            txtFloor.color = this.onFloor ? RED : WHITE;
         }
      },
   };
}

const levelConf: LevelOpt = {
   // grid size
   tileWidth: 8,
   tileHeight: 8,
   pos: vec2(0, 0),
   tiles: {
      "_": () => [
         sprite('floor', { frame: 0 }),
         "floor",
         "flatfloor",
      ],
      "⌈": () => [
         sprite('stair-blue', { frame: 0 }),
         "stair",
         "stairleft",
      ],
      "⌉": () => [
         sprite('stair-blue', { frame: 1 }),
         "stair",
         "stairright",
      ],
      "⌋": () => [
         sprite('floor-stair-blue', { frame: 0 }),
         "floor",
         "stair",
         "stairleft",
      ],
      "⌊": () => [
         sprite('floor-stair-blue', { frame: 1 }),
         "floor",
         "stair",
         "stairright",
      ],
      "(": () => [
         sprite('plate', { frame: 0 }),
         "plate",
      ],
      ")": () => [
         sprite('plate', { frame: 0, flipX: true }),
         "plate",
      ],
      "⎽": () => [
         sprite('plate', { frame: 1 }),
         "plate",
      ],
      p: () => [
         sprite("peter", { anim: 'idle' }),
         area({ shape: new Rect(vec2(0), 8, 15) }),
         anchor('center'),
         peter(),
         canWalk(),
         "player",
      ],
   },
};

const debugMode = !!location.search.match(/\bdebug\b/);
debug.inspect = debugMode;
debug.showLog = debugMode;

scene("start", () => {
   add([
      text("Press enter to start", { size: 18 }),
      pos(vec2(160, 120)),
      anchor("center"),
      color(255, 255, 255),
   ]);

   onKeyRelease("enter", ()=>go("game"));
   onKeyRelease("space", ()=>go("game"));
});

scene("game", (levelNumber = 0) => {
   // UI Setup
   const ui = add([fixed(), z(100)])

   // Level setup
   const level = addLevel(LEVELS[levelNumber], levelConf);
   const stairs = level.get('stair') as WalkableObj[];
   const floors = level.get('floor') as WalkableObj[];

   // Calculate where it is flat floor at top of stairs, which is needed to know
   // when characters can climb down from a flat floor.
   const stairtops = (level.get('flatfloor') as WalkableObj[]).filter(obj=>{
      // See if the tile below this one is a stair. If so, this is a stairtop!
      const stair = stairs.find(stair=>stair.tilePos.eq(obj.tilePos.add(0, 1)));
      if (stair) {
         obj.use('stairtop');
         if (stair.is('stairleft')) obj.use('stairleft');
         else if (stair.is('stairright')) obj.use('stairright');
      }
      return !!stair;
   });

   // Recolor odd columns of stairs
   stairs.filter(stair=>{
      if (stair.is('stairleft') && stair.tilePos.x % 2===0) return true;
      if (stair.is('stairright') && stair.tilePos.x % 2===1) return true;
   }).forEach(stair=>{
      const spriteName = (stair.is('floor') ? 'floor-' : '') + 'stair-green',
            frame = stair.is('stairleft') ? 0 : 1;
      stair.unuse('sprite');
      stair.use(sprite(spriteName, { frame }));
   });

   // Player setup
   const player: GameObj<PeterComp & PosComp & SpriteComp & WalkComp> = level.spawn("p", 16, 21.625);
   player.setObjects({ floors, stairs, stairtops });
});

go("game");
