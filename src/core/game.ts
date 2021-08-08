import { RenderingDevice } from 'mugl';
import { getNGLDevice } from 'mugl/n';

export class Game {
  public readonly device: RenderingDevice;

  private raf: number = 0;
  private screen: Screen | null = null;
  private keyDownListener = (event: KeyboardEvent) => {
    if (this.screen?.onKeyDown?.(event.key)) {
      event.preventDefault();
    }
  };
  private keyUpListener = (event: KeyboardEvent) => {
    if (this.screen?.onKeyUp?.(event.key)) {
      event.preventDefault();
    }
  };

  public constructor(
    public readonly container: HTMLElement = document.body,
    width: number, height: number
  ) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = 'crisp-edges';
    container.appendChild(canvas);

    const device = getNGLDevice(canvas, {
      powerPreference: 'low-power',
      antialias: false
    });

    if (!device) {
      throw new Error('WebGL is unsupported');
    }
    if (!device.feature('ANGLE_instanced_arrays')) {
      throw new Error('WebGL instancing (ANGLE_instanced_arrays) is unsupported');
    }

    this.device = device;
  }

  public start(): void {
    const render = (t: number) => {
      if (!this.render(t / 1000)) {
        this.raf = requestAnimationFrame(render);
      }
    };
    this.raf = requestAnimationFrame(render);
    window.addEventListener('keydown', this.keyDownListener);
    window.addEventListener('keyup', this.keyUpListener);
  }

  public pause(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.keyDownListener);
    window.removeEventListener('keyup', this.keyUpListener);
  }

  public render(t: number): boolean | void {
    return this.screen?.render(t);
  }

  public setScreen(screen: Screen): void {
    this.screen?.pause();
    this.screen = screen;
    screen.start();
  }
}

export interface Screen {
  start(): void;
  pause(): void;
  destroy(): void;
  onKeyDown?(key: string): boolean;
  onKeyUp?(key: string): boolean;
  render(t: number): boolean | void;
}
