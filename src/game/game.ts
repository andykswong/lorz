import { RenderingDevice } from 'mugl';
import { mat4, Mat4, translate, Vec3, vec3 } from 'munum';
import { OrthoCamera, Screen, SpritesRenderer } from '../engine';
import { Background } from './graphics';
import { LaDungeonGame } from './entry';
import { Sprite } from './config';
import { Character, Weapon } from './entities';
import { HitBoxWeaponNormal } from './config/physics';
import { simulate } from './physics';
import { Action, mapKeyToAction } from './action';

const tmpVec3: Vec3 = vec3.create();
const tmpMat4: Mat4 = mat4.create();

const hero = new Character(
  10,
  Sprite.HERO,
  Sprite.KNIGHTHELM,
  Sprite.CAPE0
);

hero.weapon = new Weapon(3, Sprite.SWORD, HitBoxWeaponNormal);
hero.shield = new Weapon(3, Sprite.WOODENSHIELD);
hero.velocity[0] = 20;
vec3.set(hero.position, 0, 0, 8);

const minotaur = new Character(100, Sprite.MINOTAUR);
minotaur.weapon = new Weapon(5, Sprite.GREATAXE, HitBoxWeaponNormal);
minotaur.shield = new Weapon(5, Sprite.STEELSHIELD);
minotaur.velocity[0] = -50;
vec3.set(minotaur.position, 12, 0, 8);

export class GameScreen implements Screen {
  private camera = new OrthoCamera();
  private init = false;
  private device: RenderingDevice;
  private bg: Background;
  private renderer: SpritesRenderer;
  private lastTime: number = 0;
  private actions: Action = Action.None;

  public constructor(public readonly game: LaDungeonGame) {
    this.device = game.device;
    this.bg = new Background(this.device);
    this.renderer = new SpritesRenderer(this.device, true);
  }

  public start(): void {
    if (this.init) {
      return;
    }
    this.init = true;
    this.bg.init();

    this.renderer.init();
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

    this.camera.updateProj();

    const x = Math.max(0, hero.position[0]);
    tmpVec3[0] = -x;
    translate(tmpVec3, tmpMat4);
    mat4.mul(this.camera.viewProj, tmpMat4, tmpMat4);

    this.bg.update(x);
    this.bg.render(this.camera.viewProj);

    hero.update(this.actions);
    minotaur.update(Action.Attack);

    simulate(dt, [hero, minotaur], (a, b, i) => {
      console.log('collide');
      if (a instanceof Character && b instanceof Character) {
        a.damage(b.weapon?.damage || 1);
      }
    });

    hero.render(this.renderer, t);
    minotaur.render(this.renderer, t);

    this.renderer.render(tmpMat4);

    this.lastTime = t;
  }

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
