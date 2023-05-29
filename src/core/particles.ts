import { BindGroup, BindingType, BlendFactor, Buffer, BufferUsage, Device, PrimitiveTopology, RenderPass, RenderPipeline, ShaderStage, VertexFormat, WebGL, vertexBufferLayouts } from 'mugl';
import { ReadonlyMat4, ReadonlyVec3, ReadonlyVec4, vec3, Vec3, lerp, mat } from 'munum';
import { PARTICLE_FS, PARTICLE_VS } from './shaders';

const tmpV3: Vec3 = vec3.create();

export const COMPONENTS_PER_PARTICLE = 11;

/** Particle effect renderer. */
export class ParticlesRenderer {
  private pass: RenderPass | null = null;
  private pipeline: RenderPipeline | null = null;
  private bindGroup: BindGroup | null = null;
  private vertBuffer: Buffer | null = null;
  private dataBuffer: Buffer | null = null;

  private readonly vertData: Float32Array;
  private readonly uniformData: Float32Array = new Float32Array(20);

  private _init = false;
  private instances: { start: number, maxLife: number, data: Float32Array }[] = [];

  public constructor(
    private readonly device: Device,
    max = 8 * 8 * 100
  ) {
    this.vertData = new Float32Array(COMPONENTS_PER_PARTICLE * max);
  }

  /** Starts this renderer. */
  public start(): void {
    if (this._init) {
      return;
    }

    this.pass = WebGL.createRenderPass(this.device);

    const vertex = WebGL.createShader(this.device, { code: PARTICLE_VS, usage: ShaderStage.Vertex });
    const fragment = WebGL.createShader(this.device, { code: PARTICLE_FS, usage: ShaderStage.Fragment });
    const layout = WebGL.createBindGroupLayout(this.device, {
      entries: [ { label: 'Data', type: BindingType.Buffer, binding: 0 } ]
    });

    this.pipeline = WebGL.createRenderPipeline(this.device, {
      vertex,
      fragment,
      buffers: vertexBufferLayouts([{
        attributes: [
        /* position */ VertexFormat.F32x3,
        /* velocity */ VertexFormat.F32x3,
        /* lifetime */ VertexFormat.F32,
        /* color */ VertexFormat.F32x4
        ]
      }]),
      bindGroups: [layout],
      targets: {
        blendColor: { srcFactor: BlendFactor.SrcAlpha, dstFactor: BlendFactor.OneMinusSrcAlpha },
        blendAlpha: { srcFactor: BlendFactor.One, dstFactor: BlendFactor.OneMinusSrcAlpha },
      },
      primitive: { topology: PrimitiveTopology.Points },
    })

    vertex.destroy();
    fragment.destroy();
    layout.destroy();

    this.vertBuffer = WebGL.createBuffer(this.device,
      { size: this.vertData.byteLength, usage: BufferUsage.Vertex | BufferUsage.Stream });
    this.dataBuffer = WebGL.createBuffer(this.device,
      { size: this.uniformData.byteLength, usage: BufferUsage.Uniform | BufferUsage.Stream });
    this.bindGroup = WebGL.createBindGroup(this.device, { layout, entries: [{ buffer: this.dataBuffer }] });

    this._init = true;
  }

  /** Destroys this renderer. */
  public destroy() {
    this.pass?.destroy();
    this.pipeline?.destroy();
    this.bindGroup?.destroy();
    this.vertBuffer?.destroy();
    this.dataBuffer?.destroy();
    this._init = false;
  }

  /** Submits a new particle effect. */
  public submit(
    count: number, maxLife: number,
    minPos: ReadonlyVec3, maxPos: ReadonlyVec3,
    minVec: ReadonlyVec3, maxVec: ReadonlyVec3,
    color: ReadonlyVec4
  ): void {
    const data = new Float32Array(COMPONENTS_PER_PARTICLE * count);
    for (let i = 0, c = 0; c < count; ++c) {
      for (let j = 0; j < 3; ++j) {
        tmpV3[j] = lerp(minPos[j], maxPos[j], Math.random());
      }
      mat.copy(tmpV3, data, 0, i, 3); i += 3;
      for (let j = 0; j < 3; ++j) {
        tmpV3[j] = lerp(minVec[j], maxVec[j], Math.random());
      }
      mat.copy(tmpV3, data, 0, i, 3); i += 3;
      data[i++] = Math.random() * maxLife;
      mat.copy(color, data, 0, i, 4); i += 4;
    }
    this.instances.push({ start: 0, maxLife, data });
  }

  /** Renders the queued particle effects. */
  public render(viewProj: ReadonlyMat4, time: number): void {
    if (!this.instances.length) {
      return;
    }

    // Update vertex data
    let count = 0;
    for (let i = 0; i < this.instances.length && count < this.vertData.length;) {
      const inst = this.instances[i];
      if (!inst.start) {
        inst.start = time;
      }
      if (time > inst.start + inst.maxLife) {
        this.instances[i] = this.instances[this.instances.length - 1];
        this.instances.pop();
        continue;
      }
      if (count + inst.data.length <= this.vertData.length) {
        mat.copy(inst.data, this.vertData, 0, count, inst.data.length);
        count += inst.data.length;
      }
      ++i;
    }
    WebGL.writeBuffer(this.device, this.vertBuffer as Buffer, this.vertData);

    this.uniformData.set(viewProj)
    this.uniformData[16] = time;
    WebGL.writeBuffer(this.device, this.dataBuffer as Buffer, this.uniformData);

    WebGL.beginRenderPass(this.device, this.pass as RenderPass);
    WebGL.setRenderPipeline(this.device, this.pipeline as RenderPipeline);
    WebGL.setVertex(this.device, 0, this.vertBuffer as Buffer);
    WebGL.setBindGroup(this.device, 0, this.bindGroup as BindGroup);
    WebGL.draw(this.device, count / COMPONENTS_PER_PARTICLE);
    WebGL.submitRenderPass(this.device);
  }
}
