import { Mat4, mat4, Vec3, vec3, ortho } from 'munum';

const I4 = mat4.create();

/**
 * A camera, which defines the view and projection matrices that transform from world to clip coordinates.
 */
export class Camera {
  /** The position of the camera derived from model matrix. */
  public readonly position: Vec3 = vec3.create();

  /** The view matrix, which is the inverse of camera model matrix. */
  public readonly view: Mat4 = mat4.create();

  /** The view-projection matrix derived from view and projection matrices. */
  public readonly viewProj: Mat4 = mat4.create();

  public constructor(
    /** The projection matrix. */
    public readonly proj: Mat4 = mat4.create()
  ) {
    mat4.copy(proj, this.viewProj);
  }

  /**
   * Update the camera view matrix from camera model matrix.
   */
  public updateModel(model: Mat4 = I4): void {
    vec3.set(this.position, model[12], model[13], model[14]);
    mat4.invert(model, this.view);
    mat4.mul(this.proj, this.view, this.viewProj);
  }
}

/**
 * An orthographic camera for UI.
 */
 export class UICamera extends Camera {
  public constructor(
    public width: number = 64,
    public height: number = 64,
    public znear: number = -100,
    public zfar: number = 100
  ) {
    super();
    this.updateProj();
  }

  /**
   * Update the camera projection matrix.
   */
  public updateProj(): void {
    ortho(0, this.width, this.height, 0, this.znear, this.zfar, this.proj);
    mat4.mul(this.proj, this.view, this.viewProj);
  }
}

/**
 * An orthographic camera that projects z to y axis.
 */
export class OrthoCamera extends Camera {
  public constructor(
    public width: number = 64,
    public height: number = 64
  ) {
    super();
    this.updateProj();
  }

  /**
   * Update the camera projection matrix.
   */
  public updateProj(): void {
    mat4.id(this.proj);
    this.proj[0] = 2 / this.width;
    this.proj[5] = 2 / this.height;
    this.proj[9] = this.proj[10] = -2 / this.height;
    mat4.mul(this.proj, this.view, this.viewProj);
  }
}
