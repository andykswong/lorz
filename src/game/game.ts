import { RenderingDevice } from 'mugl';
import { vec3 } from 'munum';
import { OrthoCamera, Screen, SpritesRenderer } from '../engine';
import { Background } from './graphics';
import { LaDungeonGame } from './entry';
import { frame, Sprite, WEAPON_OFFSET } from './config';
import { CharacterSprite } from './graphics/char';

export class GameScreen implements Screen {
  private camera = new OrthoCamera();
  private init = false;
  private device: RenderingDevice;
  private bg: Background;
  private renderer: SpritesRenderer;

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
    this.bg.update(t * 8);
    this.camera.updateProj();
    this.bg.render(this.camera.viewProj);

    const hero = new CharacterSprite(
      Sprite.HERO,
      Sprite.SWORD,
      Sprite.WOODENSHIELD,
      Sprite.KNIGHTHELM,
      Sprite.CAPE0
    );
    vec3.set(hero.position, 0, 0, 8);
    hero.render(this.renderer, t);

    
    const minotaur = new CharacterSprite(
      Sprite.MINOTAUR,
      Sprite.GREATAXE,
      Sprite.STEELSHIELD,
      null,
      null
    );
    vec3.set(minotaur.position, 16, 0, 8);
    minotaur.faceForward = false;
    minotaur.render(this.renderer, t);

    this.renderer.render(this.camera.viewProj);
  }
}
