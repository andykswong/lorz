import { BlendFactor, Buffer, Pipeline, PrimitiveType, RenderingDevice, RenderPass, ShaderType, UniformFormat, Usage, VertexFormat } from 'mugl';
import { array, ReadonlyMat4, ReadonlyVec3, ReadonlyVec4, vec3, Vec3, lerp } from 'munum';
import { PARTICLE_FS, PARTICLE_VS } from './shaders';

const tmpV3: Vec3 = vec3.create();

export const COMPONENTS_PER_PARTICLE = 11;

export class ParticlesRenderer {
  private pipeline: Pipeline | null = null;
  private pass: RenderPass | null = null;
  private buffer: Buffer | null = null;
  private _init = false;
  private instances: { start: number, maxLife: number, data: Float32Array }[] = [];
  private data: Float32Array;

  public constructor(
    private readonly device: RenderingDevice,
    max = 8 * 8 * 100
  ) {
    this.data = new Float32Array(COMPONENTS_PER_PARTICLE * max);
  }
  
  public init(): void {
    if (this._init) {
      return;
    }
    this._init = true;

    this.buffer = this.device.buffer({
      usage: Usage.Stream,
      size: this.data.byteLength
    })

    const vert = this.device.shader({ type: ShaderType.Vertex, source: PARTICLE_VS });
    const frag = this.device.shader({ type: ShaderType.Fragment, source: PARTICLE_FS });

    this.pipeline = this.device.pipeline({
      vert,
      frag,
      buffers: [{
        attrs: [
          { name: 'position', format: VertexFormat.Float3 },
          { name: 'velocity', format: VertexFormat.Float3 },
          { name: 'lifetime', format: VertexFormat.Float },
          { name: 'color', format: VertexFormat.Float4 }
        ]
      }],
      uniforms: [
        { name: 'vp', valueFormat: UniformFormat.Mat4 },
        { name: 'time' }
      ],
      blend: {
        srcFactorRGB: BlendFactor.SrcAlpha,
        dstFactorRGB: BlendFactor.OneMinusSrcAlpha,
        srcFactorAlpha: BlendFactor.One,
        dstFactorAlpha: BlendFactor.OneMinusSrcAlpha,
      },
      mode: PrimitiveType.Points
    })

    vert.destroy();
    frag.destroy();

    this.pass = this.device.pass();
  }

  public submit(count: number, maxLife: number, minPos: ReadonlyVec3, maxPos: ReadonlyVec3, minVec: ReadonlyVec3, maxVec: ReadonlyVec3, color: ReadonlyVec4): void {
    const data = new Float32Array(COMPONENTS_PER_PARTICLE * count);
    for (let i = 0, c = 0; c < count; ++c) {
      for (let j = 0; j < 3; ++j) {
        tmpV3[j] = lerp(minPos[j], maxPos[j], Math.random());
      }
      array.copy(tmpV3, data, 0, i, 3); i += 3;
      for (let j = 0; j < 3; ++j) {
        tmpV3[j] = lerp(minVec[j], maxVec[j], Math.random());
      }
      array.copy(tmpV3, data, 0, i, 3); i += 3;
      data[i++] = Math.random() * maxLife;
      array.copy(color, data, 0, i, 4); i += 4;
    }
    this.instances.push({
      start: 0,
      maxLife,
      data
    });
  }

  public render(viewProj: ReadonlyMat4, time: number): void {
    if (!this.instances.length) {
      return;
    }

    let count = 0;
    for (let i = 0; i < this.instances.length && count < this.data.length;) {
      const inst = this.instances[i];
      if (!inst.start) {
        inst.start = time;
      }
      if (time > inst.start + inst.maxLife) {
        this.instances[i] = this.instances[this.instances.length - 1];
        this.instances.pop();
        continue;
      }
      if (count + inst.data.length <= this.data.length) {
        array.copy(inst.data, this.data, 0, count, inst.data.length);
        count += inst.data.length;
      }
      ++i;
    }

    this.buffer!.data(this.data);
    this.device.render(this.pass!)
      .pipeline(this.pipeline!)
      .vertex(0, this.buffer!)
      .uniforms([
        { name: 'vp', values: viewProj },
        { name: 'time', value: time }
      ])
      .draw(count / COMPONENTS_PER_PARTICLE)
      .end();
  }
}
