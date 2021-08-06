import { ReadonlyVec4, vec3, Vec3 } from 'munum';
import { SpritesRenderer } from '../../engine';
import { frame, WEAPON_OFFSET } from '../config';

const tmpV3 = vec3.create();

export class CharacterSprite {
  public readonly position: Vec3 = [0, 0, 0];
  public faceForward: boolean = true;


  public constructor(
    public readonly body: ReadonlyVec4,
    public weapon: ReadonlyVec4 | null = null,
    public shield: ReadonlyVec4 | null = null,
    public armor: ReadonlyVec4 | null = null,
    public cape: ReadonlyVec4 | null = null
  ) {
  }

  public render(renderer: SpritesRenderer, t: number = 0): void {
    const dir = this.faceForward ? 1 : -1;

    renderer.submit(frame(this.body, t * 5), this.position, dir);
    this.armor && renderer.submit(this.armor, this.position, dir);
    this.cape && renderer.submit(this.cape, this.position, dir);

    const posWeapon = vec3.add(this.position, vec3.scale(WEAPON_OFFSET, dir, tmpV3), tmpV3);
    this.weapon && renderer.submit(frame(this.weapon, t), posWeapon, dir);
    this.shield && renderer.submit(this.shield, posWeapon, dir);
  }
}
