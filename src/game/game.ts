import { RenderingDevice } from 'mugl';
import { mat4, Mat4, translate, Vec3, vec3 } from 'munum';
import { Body, simulate , OrthoCamera, ParticlesRenderer, Screen, SpritesRenderer, UIRenderer, UICamera } from '../core';
import { Background } from './graphics';
import { LaDungeonGame } from './entry';
import { createDemonSkeleton, createHero, createMinotaur, createMinotaur2, createSkeleton, createSkeleton2, HIT_COLOR, MAX_COINS, TEXT_COLOR, UISprite } from './config';
import { Character, Entity } from './entities';
import { Action, mapKeyToAction } from './action';
import { playSound, Sound } from './sound';
import { Enemy } from './entities/enemy';

const tmpVec3: Vec3 = vec3.create();
const tmpMat4: Mat4 = mat4.create();

export class GameScreen implements Screen {
  public lost: boolean = false;
  public victory: boolean = false;
  public coins: number = 0;

  private init = false;
  private lastTime: number = 0;

  private device: RenderingDevice;

  private uiCamera = new UICamera();
  private camera = new OrthoCamera();
  private bg: Background;
  private renderer: SpritesRenderer;
  private uiRenderer: UIRenderer;
  private particles: ParticlesRenderer;

  private hero: Character = createHero();
  private enemies: Enemy[] = [];
  private actions: Action = Action.None;

  private entities: (Body & Entity)[] = [];

  public constructor(public readonly game: LaDungeonGame) {
    this.device = game.device;
    this.bg = new Background(this.device);
    this.renderer = new SpritesRenderer(this.device, true);
    this.uiRenderer = new UIRenderer(this.device);
    this.particles = new ParticlesRenderer(this.device);
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

    Sound.Game.currentTime = 0;
    Sound.Game.play();

    this.hero = createHero();
    this.enemies.length = 0;

    const minotaur = createMinotaur2();
    minotaur.target = this.hero;
    vec3.set(minotaur.position, 12, 0, 8);
    this.enemies.push(minotaur);

    const skel = createSkeleton();
    skel.target = this.hero;
    vec3.set(skel.position, 24, 0, 24);
    this.enemies.push(skel);
    
    const skel3 = createSkeleton2();
    skel3.target = this.hero;
    vec3.set(skel3.position, -12, 0, 12);
    this.enemies.push(skel3);

    const skel2 = createDemonSkeleton();
    skel2.target = this.hero;
    vec3.set(skel2.position, 24, 0, -12);
    this.enemies.push(skel2);
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

    if (!this.lost && this.hero.isDead) {
      this.lost = true;
      Sound.Game.pause();
      Sound.Lost.load();
      Sound.Lost.play();
    }

    this.camera.updateProj();
    this.uiCamera.updateProj();

    const x = Math.max(0, this.hero.position[0]);
    tmpVec3[0] = -x;
    translate(tmpVec3, tmpMat4);
    mat4.mul(this.camera.viewProj, tmpMat4, tmpMat4);

    this.bg.update(x);
    this.bg.render(this.camera.viewProj);

    this.hero.actions = this.actions;

    this.entities.length = 0;
    this.entities.push(this.hero);
    this.entities.push(...this.enemies);

    for (const entity of this.entities) {
      entity.update(t);
    }
  
    simulate(dt, this.entities, this.onCollide);

    for (const entity of this.entities) {
      entity.render(this.renderer, t);
    }

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
      this.uiRenderer.submitText('VICTORY', [19, 30], TEXT_COLOR, 0);
    } else if (this.lost) {
      this.uiRenderer.submitText('YOU ARE DEAD', [12, 30], TEXT_COLOR, 0);
    }

    this.uiRenderer.render(this.uiCamera.viewProj);
  }

  public onCollide = (a: Body, b: Body, sensor: number): void => {
    if (a instanceof Character) {
      let damage = 1;
      let isCut = false;
      if (b instanceof Character) {
        damage = b.weapon?.damage || 1;
        if (a instanceof Enemy && b instanceof Enemy) {
          damage = 0;
        }
        isCut = !!b.weapon;
      }
      const dir = a.position[0] < b.position[0] ? -1 : 1;
      const blocked = a.blocking && ((a.faceForward && dir < 0) || (!a.faceForward && dir > 0));
      const hit = !blocked && a.damage(damage);
      this.particles.submit(20, 0.3,
        vec3.add(a.position, [-2, 3, -2]), vec3.add(a.position, [2, 5, 2]),
        [dir < 0 ? -16 : -4, 0, -1], [dir < 0 ? 4 : 16, 6, 1],
        hit ? [...HIT_COLOR, 1] : [0.8, 0.8, 0.8, 1]
      );
      vec3.set(a.velocity, dir * damage * 24 * (hit ? 1 : 0.5), 0, (a.position[2] - b.position[2]) * 12 * (hit ? 1 : 0.5));
      if (!hit) {
        playSound(Sound.Block);
      } else {
        playSound(isCut ? Sound.Cut : Sound.Hit);
      }

      if (a.hitpoint <= 0 && a instanceof Enemy && b instanceof Character && b.isHero) {
        this.coins = Math.min(MAX_COINS, this.coins + a.coins);
        a.coins = 0;
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
    return !!action;
  }
}
