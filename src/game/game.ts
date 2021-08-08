import { RenderingDevice } from 'mugl';
import { mat4, Mat4, translate, Vec3, vec3 } from 'munum';
import { Body, simulate, OrthoCamera, ParticlesRenderer, Screen, SpritesRenderer, UIRenderer, UICamera } from '../core';
import { Background } from './graphics';
import { LowRezJam2021Game } from './entry';
import { createHero, Hero, HIT_COLOR, MAX_COINS, MIN, TEXT_COLOR, UISprite, Weapons } from './config';
import { Character, Chest, Entity, Enemy, Projectile } from './entities';
import { Action, mapKeyToAction } from './action';
import { playSound } from './sound';
import { SaveData } from './save';
import { Spawner } from './spawn';

const MAX_DIST = 128;
const HERO_HEAL_INTERVAL = 3;

const tmpVec3: Vec3 = vec3.create();
const tmpMat4: Mat4 = mat4.create();

export class GameScreen implements Screen {
  private save: SaveData;
  private coins: number = 0;
  public lost: boolean = false;
  public victory: boolean = false;

  private init = false;
  private lastTime: number = 0;

  private device: RenderingDevice;

  private uiCamera = new UICamera();
  private camera = new OrthoCamera();
  private bg: Background;
  private renderer: SpritesRenderer;
  private uiRenderer: UIRenderer;
  private particles: ParticlesRenderer;

  private spawner: Spawner;
  private hero: Character = createHero(Hero.KNIGHT);
  private heroHealTimer: number = 0;
  private enemies: Enemy[] = [];
  private items: (Body & Entity)[] = [];
  private actions: Action = Action.None;

  private entities: (Body & Entity)[] = [];

  public constructor(public readonly game: LowRezJam2021Game) {
    this.save = game.save;
    this.device = game.device;
    this.bg = new Background(this.device);
    this.renderer = new SpritesRenderer(this.device, true);
    this.uiRenderer = new UIRenderer(this.device);
    this.particles = new ParticlesRenderer(this.device);
    this.spawner = new Spawner(this.enemies, this.items);
  }

  public get ended(): boolean {
    return this.victory || this.lost;
  }

  public start(): void {
    if (!this.init) {
      this.bg.init();
      this.renderer.init();
      this.uiRenderer.init();
      this.particles.init();
    }
    this.init = true;
    this.lost = false;
    this.victory = false;
    this.coins = this.save.coins;

    playSound('Game');

    this.actions = Action.None;
    this.hero = createHero(this.game.selectedHero, this.game.selectedUnlocks);
    this.hero.position[0] = 1;
    this.heroHealTimer = 0;

    this.enemies.length = 0;
    this.items.length = 0;

    this.spawner.reset();
  }

  public pause(): void {
  }

  public destroy(): void {
    // TODO
  }

  public render(t: number): boolean | void {
    if (!this.lastTime) {
      this.lastTime = t;
    }
    const dt = t - this.lastTime;
    const x = Math.max(0, this.hero.position[0]);

    // Update

    this.checkEndGame();

    this.bg.update(x);
    this.spawner.update(x, this.hero);
    this.updateEntities(t, dt);
    simulate(dt, this.entities, this.onCollide);
    for (const entity of this.entities) {
      entity.render(this.renderer, t);
    }

    // Render

    this.bg.render(this.camera.viewProj);

    this.camera.updateProj();
    tmpVec3[0] = -x;
    translate(tmpVec3, tmpMat4);
    mat4.mul(this.camera.viewProj, tmpMat4, tmpMat4);
    this.renderer.render(tmpMat4);
    this.particles.render(tmpMat4, t);

    this.renderUI();

    this.lastTime = t;
  }

  public renderUI(): void {
    const text = this.coins.toString();
    this.uiRenderer.submitText(text, [63, 1], TEXT_COLOR, 1);
    this.uiRenderer.submit(UISprite.COIN, [63 - text.length * 4 - 5, 1], [1, 1]);

    const hpBarWidth = 24;
    const remainingHpWidth = Math.max(0, this.hero.hitpoint / this.hero.maxHitPoint * hpBarWidth);
    this.uiRenderer.submit(UISprite.HPBG, [1, 1], [hpBarWidth + 2, 1.5]);
    remainingHpWidth && this.uiRenderer.submit(UISprite.HP, [1, 1], [remainingHpWidth, 2]);

    if (this.victory) {
      this.uiRenderer.submitText('VICTORY!', [18, 30], TEXT_COLOR, 0);
    } else if (this.lost) {
      this.uiRenderer.submitText('YOU ARE DEAD!', [11, 30], TEXT_COLOR, 0);
    }

    this.uiCamera.updateProj();
    this.uiRenderer.render(this.uiCamera.viewProj);
  }

  public onCollide = (a: Body, b: Body, sensor: number): void => {
    if (a instanceof Chest && !a.isOpen) {
      if (b instanceof Character && b.isHero || b instanceof Projectile && b.owner?.isHero) {
        a.isOpen = true;
        this.coins += a.coins;
        playSound('Coin');
      }
    }

    if (a instanceof Projectile) {
      let damage = 0;
      if (b instanceof Character && a.owner !== b) {
        damage = b.weapon?.damage || b.attack;
      } else if (b instanceof Projectile) {
        damage = b.damage;
      }
      a.hitpoint -= damage;
    }

    if (a instanceof Character) {
      let damage = 0;
      let pushBack = 0;
      let isCut = false;
      if (b instanceof Character) {
        damage = b.weapon?.damage || b.attack;
        pushBack = b.weapon?.pushBack || 1;
        if (a instanceof Enemy && b instanceof Enemy) {
          damage = 0;
        }
        isCut = !!b.weapon;
      } else if (b instanceof Projectile && !b.isDead && b.owner !== a) {
        damage = b.damage;
        b.hitpoint -= damage;
        isCut = b.isSharp;
      }
      if (damage > 0) {
        const dir = a.position[0] < b.position[0] ? -1 : 1;
        const frontAttack = (a.faceForward && dir < 0) || (!a.faceForward && dir > 0);
        const hit = a.damage(damage, frontAttack);
        this.particles.submit(20, 0.3,
          vec3.add(a.position, [-2, 3, -2]), vec3.add(a.position, [2, 5, 2]),
          [dir < 0 ? -16 : -4, 0, -1], [dir < 0 ? 4 : 16, 6, 1],
          hit ? [...HIT_COLOR, 1] : [0.8, 0.8, 0.8, 1]
        );
        vec3.set(a.velocity, dir * pushBack * damage * 24 * (hit ? 1 : 0.5), 0, (a.position[2] - b.position[2]) * 12 * (hit ? 1 : 0.5));
        if (!hit) {
          playSound('Block');
        } else {
          playSound(isCut ? 'Cut' : 'Hit');
        }

        if (a.hitpoint <= 0 && a instanceof Enemy &&
          ((b instanceof Character && b.isHero) || b instanceof Projectile && b.owner?.isHero)
        ) {
          if (a.shield === Weapons.MONEYBAG) {
            playSound('Coin');
          }
          this.coins = Math.min(MAX_COINS, this.coins + a.coins);
          a.coins = 0;
        }
      }
    }
  };

  public onKeyDown(key: string): boolean {
    const action: Action = mapKeyToAction(key);
    this.actions = this.actions | action;
    return !!action;
  }

  public onKeyUp(key: string): boolean {
    const action: Action | null = mapKeyToAction(key);
    this.actions = this.actions & (~action);

    if (this.ended && action === Action.Attack) {
      this.game.restart();
    }

    return !!action;
  }

  private checkEndGame(): void {
    let isEnd = false;
    if (!this.lost && this.hero.isDead) {
      this.lost = true;
      isEnd = true;
    }

    if (!isEnd) {
      return;
    }

    this.save.coins = this.coins;

    if (this.lost) {
      playSound('Lost');
    } else {
      playSound('Victory');
    }
  }

  private updateEntities(t: number, dt: number): void {
    this.hero.actions = this.actions;
    if (this.hero.projectile) {
      this.items.push(this.hero.projectile!);
      this.hero.projectile = null;
    }

    for (let i = 0; i < this.enemies.length;) {
      const enemy = this.enemies[i];
      if (enemy.isDead ||
        (this.hero.position[0] - enemy.position[0] > MAX_DIST) ||
        (this.hero.position[0] - enemy.position[0] < -MAX_DIST && enemy.hitpoint/enemy.maxHitPoint <= enemy.fleeThreshold)
      ) {
        this.enemies[i] = this.enemies[this.enemies.length - 1];
        this.enemies.pop();
      } else {
        if (enemy.projectile) {
          this.items.push(enemy.projectile!);
          enemy.projectile = null;
        }
        ++i;
      }
    }

    for (let i = 0; i < this.items.length;) {
      if (this.items[i].isDead ||
        (this.items[i].position[0] <= MIN[0] && this.items[i].velocity[0] <= 0) ||
        (Math.abs(this.hero.position[0] - this.items[i].position[0]) > MAX_DIST) 
      ) {
        this.items[i] = this.items[this.items.length - 1];
        this.items.pop();
      } else {
        ++i;
      }
    }

    this.entities.length = 0;
    this.entities.push(this.hero);
    this.entities.push(...this.enemies);
    this.entities.push(...this.items);

    this.healHero(dt);

    for (const entity of this.entities) {
      entity.update(t);
    }
  }

  private healHero(delta: number): void {
    if (this.ended) {
      return;
    }
    this.heroHealTimer += delta;
    if (this.heroHealTimer >= HERO_HEAL_INTERVAL && this.hero.hitpoint < this.hero.maxHitPoint) {
      this.hero.hitpoint++;
      this.heroHealTimer = this.heroHealTimer % HERO_HEAL_INTERVAL;
    }
  }
}
