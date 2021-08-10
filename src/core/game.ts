import { RenderingDevice } from 'mugl';
import { getNGLDevice } from 'mugl/n';

export class Game {
  public readonly canvas: HTMLCanvasElement;
  public readonly device: RenderingDevice;

  private raf: number = 0;
  private _screen: Screen | null = null;

  private keyDownListener = (event: KeyboardEvent) => {
    if (this._screen?.onKeyDown?.(event.key)) {
      event.preventDefault();
    }
  };
  private keyUpListener = (event: KeyboardEvent) => {
    if (this._screen?.onKeyUp?.(event.key)) {
      event.preventDefault();
    }
  };
  private pointerDownListener = pointerEvent(this, (x, y, i) => this._screen?.onPointerDown?.(x, y, i) || false);
  private pointerUpListener = pointerEvent(this, (x, y, i) => this._screen?.onPointerUp?.(x, y, i) || false);
  private pointerMoveListener = pointerEvent(this, (x, y, i) => this._screen?.onPointerMove?.(x, y, i) || false);

  public constructor(
    public readonly container: HTMLElement = document.body,
    width: number, height: number
  ) {
    const canvas = this.canvas = document.createElement('canvas');
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
    this.canvas.addEventListener('pointerdown', this.pointerDownListener);
    this.canvas.addEventListener('pointerup', this.pointerUpListener);
    this.canvas.addEventListener('pointermove', this.pointerMoveListener);
  }

  public pause(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.keyDownListener);
    window.removeEventListener('keyup', this.keyUpListener);
    this.canvas.removeEventListener('pointerdown', this.pointerDownListener);
    this.canvas.removeEventListener('pointerup', this.pointerUpListener);
    this.canvas.removeEventListener('pointermove', this.pointerMoveListener);
  }

  public render(t: number): boolean | void {
    return this._screen?.render(t);
  }

  public get screen(): Screen {
    return this.screen;
  }

  public set screen(screen: Screen) {
    this._screen?.pause();
    this._screen = screen;
    screen.start();
  }
}

export interface Screen {
  start(): void;
  pause(): void;
  destroy(): void;
  onPointerUp?(x: number, y: number, i: number): boolean;
  onPointerMove?(x: number, y: number, i: number): boolean;
  onPointerDown?(x: number, y: number, i: number): boolean;
  onKeyDown?(key: string): boolean;
  onKeyUp?(key: string): boolean;
  render(t: number): boolean | void;
}

function pointerEvent(game: Game, handler: (x: number, y: number, i: number) => boolean): (event: PointerEvent) => void {
  return (event: PointerEvent) => {
    const rect = game.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * game.canvas.width;
    const y = (event.clientY - rect.top) / rect.height * game.canvas.height;
    if (handler(x, y, event.pointerId || 0)) {
      event.preventDefault();
    }
  };
}
