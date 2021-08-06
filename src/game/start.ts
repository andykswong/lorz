import { RenderingDevice, RenderPass } from 'mugl';
import { OrthoCamera, Screen } from '../engine';
import { LaDungeonGame } from './entry';

export class StartScreen implements Screen {
  private camera = new OrthoCamera();
  private init = false;
  private device: RenderingDevice;
  private pass: RenderPass | null = null;

  public constructor(public readonly game: LaDungeonGame) {
    this.device = game.device;
  }

  public start(): void {
    if (this.init) {
      return;
    }
    this.init = true;

    this.pass = this.device.pass({
      clearColor: [0x47 / 0xFF, 0x2d / 0xFF, 0x3c / 0xFF, 1]
    });
  }

  public pause(): void {
  }

  public destroy(): void {
    // TODO
  }

  public render(t: number): boolean | void {
    this.device
      .render(this.pass!)
      .end();
  }
}
