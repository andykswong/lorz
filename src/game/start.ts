import { RenderingDevice, RenderPass } from 'mugl';
import { ReadonlyVec4, vec3 } from 'munum';
import { OrthoCamera, Screen, SpritesRenderer, UICamera, UIRenderer } from '../core';
import { Action, mapGamepadActions, mapKeyToAction } from './action';
import { createHero, GREY_TEXT_COLOR, Hero, Sprite, TEXT_COLOR, UISprite, UnlockTable } from './config';
import { Character } from './entities';
import { LowRezJam2021Game } from './entry';
import { GameSave } from './save';
import { playSound } from './sound';

const LEFT_ARROW_COORD = [4, 32] as const;
const RIGHT_ARROW_COORD = [56, 32] as const;
const UPDOWN_ARROW_COORD = [8, 42] as const;
const START_COORD = [18, 56] as const;
const START_SIZE = [29, 5] as const;
const BUY_RECT = [18, 42, 38, 5] as const;

export class StartScreen implements Screen {
  private camera = new UICamera();
  private charCamera = new OrthoCamera();
  private init = false;
  private device: RenderingDevice;
  private pass: RenderPass | null = null;
  private uiRenderer: UIRenderer;
  private renderer: SpritesRenderer;
  private save: GameSave;

  private currentHero: number = 0;
  private currentUnlock: number = 0;
  private hero: Character = createHero(Hero.KNIGHT);

  private gamePadActions: Action = Action.None;

  public constructor(public readonly game: LowRezJam2021Game) {
    this.save = game.save;
    this.device = game.device;
    this.uiRenderer = new UIRenderer(this.device);
    this.renderer = new SpritesRenderer(this.device, true);
  }

  public start(): void {
    if (!this.init) {
      this.pass = this.device.pass({
        clearColor: [0x47 / 0xFF, 0x2d / 0xFF, 0x3c / 0xFF, 1]
      });
      this.uiRenderer.init();
      this.renderer.init();
    }
    this.init = true;

    playSound('Game');

    this.currentHero = UnlockTable.reduce((idx, hero, currentIdx) => (hero.hero === this.save.hero ? currentIdx : idx), 0);
    this.currentUnlock = 0;

    this.updateHero();
  }

  public pause(): void {
  }

  public destroy(): void {
    // TODO
  }

  public render(t: number): boolean | void {
    this.handleGamepad();

    this.uiRenderer.submitText('DUNGEON  OF  LORZ', [4, 16], TEXT_COLOR, 0, [1, 1.4]);
    this.uiRenderer.submitText('START - E', START_COORD, TEXT_COLOR, 0);

    const currentHero = UnlockTable[this.currentHero];
    if (!this.currentUnlock) {
      if (this.save.isHeroUnlocked(currentHero.hero)) {
        this.renderShopBtn(currentHero.hero === this.save.hero);
      } else {
        this.renderBuyBtn();
      }
    } else {
      const unlock = currentHero.unlocks[this.currentUnlock - 1];
      if (this.save.isUnlocked(unlock.type)) {
        this.renderShopBtn(
          (!!(unlock.type & this.save.equipped) && this.save.hero === currentHero.hero) ||
          !this.save.isHeroUnlocked(currentHero.hero)
        );
      } else {
        this.renderBuyBtn();
      }
    }

    const text = this.save.coins.toString();
    this.uiRenderer.submitText(text, [63, 1], TEXT_COLOR, 1);
    this.uiRenderer.submit(UISprite.COIN, [63 - text.length * 4 - 5, 1], [1, 1]);

    this.uiRenderer.submit(UISprite.LEFT, LEFT_ARROW_COORD, [1, 1], TEXT_COLOR);
    this.uiRenderer.submit(UISprite.RIGHT, RIGHT_ARROW_COORD, [1, 1], TEXT_COLOR);

    const name = this.currentUnlock ? UnlockTable[this.currentHero].unlocks[this.currentUnlock - 1].name : UnlockTable[this.currentHero].name;
    this.uiRenderer.submitText(name, [52, 34], TEXT_COLOR, 1);

    vec3.set(this.hero.position, -16, -7, 0);
    this.hero.actions = Action.Attack;
    this.hero.sprite.isAttacking = t % 4 < 1 ? t % 1 : 0;
    this.hero.sprite.isBlocking = Math.floor(t % 4) === 2;
    this.hero.sprite.isWalking = true;
    this.hero.render(this.renderer, t);

    for (let j = 0; j < 10; ++j) {
      this.renderer.submit(Sprite.WALL0, [j * 8 - 36, 16, 0]);
    }
    this.renderer.submit(Sprite.WALL1, [2 * 8 - 36, 16, 0]);
    this.renderer.submit(Sprite.WALL1, [7 * 8 - 36, 16, 0]);
    this.renderer.submit(Sprite.WALL2, [4 * 8 - 36, 16, 0]);
    this.renderer.submit(Sprite.WALL3, [5 * 8 - 36, 16, 0]);

    this.device
      .render(this.pass!)
      .end();

    this.camera.updateProj();
    this.charCamera.updateProj();
    this.renderer.render(this.charCamera.viewProj);
    this.uiRenderer.render(this.camera.viewProj);
  }

  public onKeyUp(key: string): boolean {
    const action: Action = mapKeyToAction(key);
    if (!action) {
      return false;
    }
    return this.act(action);
  }

  public onPointerUp(x: number, y: number): boolean {
    if (clickedWith(x, y, ...LEFT_ARROW_COORD, UISprite.LEFT[2], UISprite.LEFT[3])) {
      this.act(Action.Left);
      return true;
    }

    if (clickedWith(x, y, ...RIGHT_ARROW_COORD, UISprite.RIGHT[2], UISprite.RIGHT[3])) {
      this.act(Action.Right);
      return true;
    }

    if (clickedWith(x, y, ...START_COORD, ...START_SIZE)) {
      this.act(Action.Attack);
      return true;
    }
    
    if (clickedWith(x, y, ...UPDOWN_ARROW_COORD, UISprite[';'][2] + 4, UISprite[';'][3])) {
      this.act(Action.Up);
      return true;
    }
        
    if (clickedWith(x, y, ...BUY_RECT)) {
      this.act(Action.Block);
      return true;
    }

    return false;
  }

  private handleGamepad(): void {
    const actions = mapGamepadActions();
    for (const action of [Action.Left, Action.Right, Action.Up, Action.Down]) {
      if (!(this.gamePadActions & action) && (actions & action)) {
        this.act(action);
        break;
      }
    }
    if ((this.gamePadActions & Action.Block) && !(actions & Action.Block)) {
      this.act(Action.Block);
    } else if ((this.gamePadActions & Action.Attack) && !(actions & Action.Attack)) {
      this.act(Action.Attack);
    }
    this.gamePadActions = actions;
  }

  private act(action: Action): boolean {
    if (action === Action.Attack) {
      this.game.startGame();
      return true;
    }

    if (action === Action.Block) {
      const hero = UnlockTable[this.currentHero].hero;

      if (this.canBuyCurrent()) {
        if (!this.currentUnlock) {
          this.save.unlockHero(this.save.hero = hero);
          this.save.coins = this.save.coins - UnlockTable[this.currentHero].coins;
        } else {
          const unlock = UnlockTable[this.currentHero].unlocks[this.currentUnlock - 1];
          this.save.unlock(unlock.type);
          this.save.coins = this.save.coins - unlock.coins;
        }
      } else {
        if (!this.currentUnlock) {
          if (this.save.isHeroUnlocked(hero)) {
            this.save.hero = hero;
          }
        } else {
          const unlock = UnlockTable[this.currentHero].unlocks[this.currentUnlock - 1];
          if (this.save.isHeroUnlocked(hero) && this.save.isUnlocked(unlock.type)) {
            let equipped = !!(this.save.equippedFor(hero) & unlock.type);
            if (this.save.hero !== hero) {
              this.save.hero = hero;
              equipped = false;
            }
            this.save.equipped = this.save.equipped & (~(unlock.exclude || 0));
            this.save.equipped = equipped ? (this.save.equipped & (~unlock.type)) : (this.save.equipped | unlock.type);
          }
        }
      }
    }

    if (action & Action.Right) {
      this.currentHero = (this.currentHero + 1) % UnlockTable.length;
      this.currentUnlock = 0;
    }
    if (action & Action.Left) {
      this.currentHero = (this.currentHero + UnlockTable.length - 1) % UnlockTable.length;
      this.currentUnlock = 0;
    }
    if (action & Action.Up) {
      this.currentUnlock = (this.currentUnlock + 1) % (UnlockTable[this.currentHero].unlocks.length + 1);
    }
    if (action & Action.Down) {
      this.currentUnlock = (this.currentUnlock + UnlockTable[this.currentHero].unlocks.length) % (UnlockTable[this.currentHero].unlocks.length + 1);
    }

    this.updateHero();

    return true;
  }

  private canBuyCurrent(): boolean {
    const hero = UnlockTable[this.currentHero];
    if (!this.currentUnlock) {
      return !this.save.isHeroUnlocked(hero.hero) && this.save.coins >= hero.coins;
    } else {
      const unlock = UnlockTable[this.currentHero].unlocks[this.currentUnlock - 1];
      return this.save.isHeroUnlocked(hero.hero)
        && !this.save.isUnlocked(unlock.type)
        && this.save.isUnlocked(unlock.required || 0)
        && this.save.coins >= unlock.coins;
    }
  }

  private renderBuyBtn(): void {
    const coins = this.currentUnlock ?
      UnlockTable[this.currentHero].unlocks[this.currentUnlock - 1].coins :
      UnlockTable[this.currentHero].coins;
    const canBuy = this.canBuyCurrent();
    const color: ReadonlyVec4 = canBuy ? TEXT_COLOR : GREY_TEXT_COLOR;
    this.uiRenderer.submitText(';', UPDOWN_ARROW_COORD, TEXT_COLOR, 0);
    this.uiRenderer.submitText('BUY - Q', [13, 42], color, 0);
    this.uiRenderer.submit(UISprite.COIN, [36, 42], [1, 1], canBuy ? undefined : GREY_TEXT_COLOR);
    this.uiRenderer.submitText(coins.toString(), [42, 42], color, 0);
  }

  private renderShopBtn(selected: boolean): void {
    this.uiRenderer.submitText('; SHOP', UPDOWN_ARROW_COORD, TEXT_COLOR, 0);
    this.uiRenderer.submitText('USE - Q', [56, 42], selected ? GREY_TEXT_COLOR : TEXT_COLOR, 1);
  }

  private updateHero(): void {
    const hero = UnlockTable[this.currentHero];
    let unlocks = this.save.equippedFor(hero.hero);
    if (this.currentUnlock) {
      const unlock = hero.unlocks[this.currentUnlock - 1];
      unlocks = unlocks & (~(unlock.exclude || 0));
      unlocks = unlocks | unlock.type;
    }
    this.hero = createHero(hero.hero, unlocks);
  }
}

function clickedWith(x: number, y: number, rectX: number, rectY: number, rectWidth: number, rectHeight: number): boolean {
  return (x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight);
}
