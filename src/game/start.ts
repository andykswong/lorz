import { RenderingDevice, RenderPass } from 'mugl';
import { ReadonlyVec4, vec3 } from 'munum';
import { OrthoCamera, Screen, SpritesRenderer, UICamera, UIRenderer } from '../core';
import { Action, mapKeyToAction } from './action';
import { createHero, GREY_TEXT_COLOR, Hero, Sprite, TEXT_COLOR, UISprite, Unlockable, UnlockTable } from './config';
import { Character } from './entities';
import { LowRezJam2021Game } from './entry';
import { SaveData } from './save';
import { Sound } from './sound';

export class StartScreen implements Screen {
  private camera = new UICamera();
  private charCamera = new OrthoCamera();
  private init = false;
  private device: RenderingDevice;
  private pass: RenderPass | null = null;
  private uiRenderer: UIRenderer;
  private renderer: SpritesRenderer;
  private save: SaveData;

  private curretHero: number = 0;
  private curretUnlock: number = 0;
  private selectedHero: Hero = Hero.KNIGHT;
  private selectedUnlocks: Unlockable = 0;
  private hero: Character = createHero(Hero.KNIGHT);

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

    Sound.Game.currentTime = 0;
    Sound.Game.play();

    this.curretHero = UnlockTable.reduce((idx, hero, currentIdx) => (hero.hero === this.selectedHero ? currentIdx : idx), 0);
    this.curretUnlock = 0;

    this.updateHero();
  }

  public pause(): void {
  }

  public destroy(): void {
    // TODO
  }

  public render(t: number): boolean | void {
    this.uiRenderer.submitText('DUNGEON  OF  LORZ', [4, 16], TEXT_COLOR, 0, [1, 1.4]);
    this.uiRenderer.submitText('START - E', [18, 56], TEXT_COLOR, 0);

    if (!this.curretUnlock) {
      if (this.save.isHeroUnlocked(UnlockTable[this.curretHero].hero)) {
        this.renderShopBtn();
      } else {
        this.renderBuyBtn();
      }
    } else {
      const unlock = UnlockTable[this.curretHero].unlocks[this.curretUnlock - 1];
      if (this.save.isUnlocked(unlock.type)) {
        this.renderEquipBtn(!!(unlock.type & this.selectedUnlocks) && this.selectedHero === UnlockTable[this.curretHero].hero);
      } else {
        this.renderBuyBtn();
      }
    }

    const text = this.save.coins.toString();
    this.uiRenderer.submitText(text, [63, 1], TEXT_COLOR, 1);
    this.uiRenderer.submit(UISprite.COIN, [63 - text.length * 4 - 5, 1], [1, 1]);

    this.uiRenderer.submit(UISprite.LEFT, [4, 32], [1, 1], TEXT_COLOR);
    this.uiRenderer.submit(UISprite.RIGHT, [56, 32], [1, 1], TEXT_COLOR);

    const name = this.curretUnlock ? UnlockTable[this.curretHero].unlocks[this.curretUnlock - 1].name : UnlockTable[this.curretHero].name;
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

    if (action === Action.Attack) {
      this.game.selectedHero = this.selectedHero;
      this.game.selectedUnlocks = this.selectedUnlocks;
      this.game.startGame();
      return true;
    }

    if (action === Action.Block) {
      if (this.canBuyCurrent()) {
        if (!this.curretUnlock) {
          this.save.unlockHero(this.selectedHero = UnlockTable[this.curretHero].hero);
          this.save.coins = this.save.coins - UnlockTable[this.curretHero].coins;
          this.selectedUnlocks = 0;
        } else {
          const unlock = UnlockTable[this.curretHero].unlocks[this.curretUnlock - 1];
          if (this.selectedHero === UnlockTable[this.curretHero].hero) {
            this.selectedUnlocks = this.selectedUnlocks & (~(unlock.exclude || 0));
            this.selectedUnlocks = this.selectedUnlocks | unlock.type;
          }
          this.save.unlock(unlock.type);
          this.save.coins = this.save.coins - unlock.coins;
        }
      } else {
        if (!this.curretUnlock) {
          const hero = UnlockTable[this.curretHero].hero;
          if (this.selectedHero !== hero && this.save.isHeroUnlocked(hero)) {
            this.selectedHero = hero;
            this.selectedUnlocks = 0;
          }
        } else {
          const unlock = UnlockTable[this.curretHero].unlocks[this.curretUnlock - 1];
          if (this.selectedHero === UnlockTable[this.curretHero].hero && this.save.isUnlocked(unlock.type)) {
            this.selectedUnlocks = this.selectedUnlocks & (~(unlock.exclude || 0));
            this.selectedUnlocks = this.selectedUnlocks ^ unlock.type;
          }
        }
      }
    }

    if (action === Action.Right) {
      this.curretHero = (this.curretHero + 1) % UnlockTable.length;
      this.curretUnlock = 0;
    }
    if (action === Action.Left) {
      this.curretHero = (this.curretHero + UnlockTable.length - 1) % UnlockTable.length;
      this.curretUnlock = 0;
    }
    if (action === Action.Up) {
      this.curretUnlock = (this.curretUnlock + 1) % (UnlockTable[this.curretHero].unlocks.length + 1);
    }
    if (action === Action.Down) {
      this.curretUnlock = (this.curretUnlock + UnlockTable[this.curretHero].unlocks.length) % (UnlockTable[this.curretHero].unlocks.length + 1);
    }

    this.updateHero();

    return true;
  }

  private canBuyCurrent(): boolean {
    const hero = UnlockTable[this.curretHero];
    if (!this.curretUnlock) {
      return !this.save.isHeroUnlocked(hero.hero) && this.save.coins >= hero.coins;
    } else {
      const unlock = UnlockTable[this.curretHero].unlocks[this.curretUnlock - 1];
      return this.save.isHeroUnlocked(hero.hero)
        && !this.save.isUnlocked(unlock.type)
        && this.save.isUnlocked(unlock.required || 0)
        && this.save.coins >= unlock.coins;
    }
  }

  private renderBuyBtn(): void {
    const coins = this.curretUnlock ?
      UnlockTable[this.curretHero].unlocks[this.curretUnlock - 1].coins :
      UnlockTable[this.curretHero].coins;
    const canBuy = this.canBuyCurrent();
    const color: ReadonlyVec4 = canBuy ? TEXT_COLOR : GREY_TEXT_COLOR;
    this.uiRenderer.submitText(';', [8, 42], TEXT_COLOR, 0);
    this.uiRenderer.submitText('BUY - Q', [13, 42], color, 0);
    this.uiRenderer.submit(UISprite.COIN, [36, 42], [1, 1], canBuy ? undefined : GREY_TEXT_COLOR);
    this.uiRenderer.submitText(coins.toString(), [42, 42], color, 0);
  }

  private renderShopBtn(): void {
    const selected = UnlockTable[this.curretHero].hero === this.selectedHero;
    this.uiRenderer.submitText('; SHOP', [8, 42], TEXT_COLOR, 0);
    this.uiRenderer.submitText('USE - Q', [56, 42], selected ? GREY_TEXT_COLOR : TEXT_COLOR, 1);
  }

  private renderEquipBtn(equipped: boolean = false): void {
    this.uiRenderer.submitText(';', [15, 42], TEXT_COLOR, 0);
    this.uiRenderer.submitText('EQUIP - Q', [20, 42], equipped ? GREY_TEXT_COLOR : TEXT_COLOR, 0);
  }

  private updateHero(): void {
    let unlocks = this.selectedUnlocks;
    if (this.curretUnlock) {
      const unlock = UnlockTable[this.curretHero].unlocks[this.curretUnlock - 1];
      unlocks = unlocks & (~(unlock.exclude || 0));
      unlocks = unlocks | unlock.type;
    }
    this.hero = createHero(UnlockTable[this.curretHero].hero, unlocks);
  }
}
