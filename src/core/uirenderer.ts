import { BindGroup, BindingType, BlendFactor, Buffer, BufferUsage, Color, Device, FilterMode, RenderPass, RenderPipeline, Sampler, ShaderStage, Texture, VertexFormat, WebGL, vertexBufferLayouts } from 'mugl';
import { mat, ReadonlyMat4, ReadonlyVec2, ReadonlyVec4, vec2, Vec2 } from 'munum';
import { UISprite } from '../game/config';
import { toVertices, UIQuad } from './model';
import {UI_FS, UI_VS } from './shaders';

const tmpV2: Vec2 = vec2.create();

const COLOR_NONE: Color = [0, 0, 0, 0];
const QUAT_VERT = toVertices(UIQuad);

export const COMPONENTS_PER_UI_SPRITE = 12;

/** A UI renderer. */
export class UIRenderer {
  private pass: RenderPass | null = null;
  private pipeline: RenderPipeline | null = null;
  private bindGroup: BindGroup | null = null;
  private buffer: Buffer | null = null;
  private instBuffer: Buffer | null = null;
  private dataBuffer: Buffer | null = null;
  private tex: Texture | null = null;
  private sampler: Sampler | null = null;
  private readonly data: Float32Array;
  private readonly uniformData: Float32Array = new Float32Array(20);
  private _init = false;
  protected i = 0;

  public constructor(
    private readonly device: Device,
    private readonly sprite: TexImageSource = document.getElementById('sprites') as TexImageSource,
    private max = 8 * 8 * 5
  ) {
    this.data = new Float32Array(COMPONENTS_PER_UI_SPRITE * max);
  }
  
  /** Starts the renderer. */
  public start(): void {
    if (this._init) {
      return;
    }

    this.pass = WebGL.createRenderPass(this.device);

    const vertex = WebGL.createShader(this.device, { code: UI_VS, usage: ShaderStage.Vertex });
    const fragment = WebGL.createShader(this.device, { code: UI_FS, usage: ShaderStage.Fragment });

    const layout = WebGL.createBindGroupLayout(this.device, {
      entries: [
        { label: 'Data', type: BindingType.Buffer, binding: 0 },
        { label: 'tex', type: BindingType.Texture, binding: 1 },
        { label: 'tex', type: BindingType.Sampler, binding: 2 },
      ]
    });

    this.pipeline = WebGL.createRenderPipeline(this.device, {
      vertex,
      fragment,
      buffers: vertexBufferLayouts([
        { attributes: [ /* qpos */ VertexFormat.F32x2, /* uv */ VertexFormat.F32x2] },
        {
          instanced: true, attributes: [
          /* quad */ VertexFormat.F32x4,
          /* position */ VertexFormat.F32x2,
          /* scale */ VertexFormat.F32x2,
          /* color */ VertexFormat.F32x4,
          ]
        },
      ]),
      bindGroups: [layout],
      targets: {
        blendColor: { srcFactor: BlendFactor.SrcAlpha, dstFactor: BlendFactor.OneMinusSrcAlpha },
        blendAlpha: { srcFactor: BlendFactor.One, dstFactor: BlendFactor.OneMinusSrcAlpha },
      },
    });

    vertex.destroy();
    fragment.destroy();
    layout.destroy();

    this.buffer = WebGL.createBuffer(this.device,
      { size: QUAT_VERT.byteLength, usage: BufferUsage.Vertex });
    WebGL.writeBuffer(this.device, this.buffer, QUAT_VERT);
    this.instBuffer = WebGL.createBuffer(this.device,
      { size: this.data.byteLength, usage: BufferUsage.Vertex | BufferUsage.Stream });
    this.dataBuffer = WebGL.createBuffer(this.device,
      { size: this.uniformData.byteLength, usage: BufferUsage.Uniform | BufferUsage.Stream });

    this.tex = WebGL.createTexture(this.device, { size: [this.sprite.width, this.sprite.height, 1] });
    this.sampler = WebGL.createSampler(this.device, { minFilter: FilterMode.Nearest, magFilter: FilterMode.Nearest });
    WebGL.copyExternalImageToTexture(this.device, { src: this.sprite }, { texture: this.tex });

    this.bindGroup = WebGL.createBindGroup(this.device, { layout, entries: [
      { buffer: this.dataBuffer },
      { texture: this.tex },
      { sampler: this.sampler }, 
    ] });

    this._init = true;
  }

  /** Destroys this renderer. */
  public destroy() {
    this.pass?.destroy();
    this.pipeline?.destroy();
    this.bindGroup?.destroy();
    this.buffer?.destroy();
    this.instBuffer?.destroy();
    this.dataBuffer?.destroy();
    this.tex?.destroy();
    this.sampler?.destroy();
    this._init = false;
  }

  /** Submits a text to render. */
  public submitText(text: string, pos: ReadonlyVec2, color: Color, align: number = -1, scale: ReadonlyVec2 = [1, 1]): void {
    let offset = 0;
    for (let i = 0; i < text.length; ++i) {
      offset += (text[i] == ' ') ? 1 : (3 + (i > 0 ? 1 : 0));
    }
    tmpV2[0] = pos[0] + (align > 0 ? -offset : 0);
    tmpV2[1] = pos[1];
    for (let i = 0; i < text.length; ++i, tmpV2[0] += 4 * scale[0]) {
      while (text[i] == ' ') {
        tmpV2[0] += scale[0];
        ++i;
      }
      this.submit(UISprite[text[i]], tmpV2, scale, color);
    }
  }

  /** Submits a sprite to render. */
  public submit(quad: ReadonlyVec4, pos: ReadonlyVec2, scale: ReadonlyVec2, color: Color = COLOR_NONE): void {
    if (this.i + COMPONENTS_PER_UI_SPRITE >= this.max * COMPONENTS_PER_UI_SPRITE) {
      throw new RangeError('Buffer overflow');
    }
    mat.copy(quad, this.data, 0, this.i, 4); this.i += 4;
    mat.copy(pos, this.data, 0, this.i, 3); this.i += 2;
    mat.copy(scale, this.data, 0, this.i, 3); this.i += 2;
    mat.copy(color, this.data, 0, this.i, 4); this.i += 4;
  }

  /** Renders queued sprites. */
  public render(viewProj: ReadonlyMat4): void {
    if (!this.i) {
      return;
    }

    WebGL.writeBuffer(this.device, this.instBuffer as Buffer, this.data);
    this.uniformData.set(viewProj);
    this.uniformData[16] = this.sprite.width;
    this.uniformData[17] = this.sprite.height;
    WebGL.writeBuffer(this.device, this.dataBuffer as Buffer, this.uniformData);

    WebGL.beginRenderPass(this.device, this.pass as RenderPass);
    WebGL.setRenderPipeline(this.device, this.pipeline as RenderPipeline);
    WebGL.setVertex(this.device, 0, this.buffer as Buffer);
    WebGL.setVertex(this.device, 1, this.instBuffer as Buffer);
    WebGL.setBindGroup(this.device, 0, this.bindGroup as BindGroup);
    WebGL.draw(this.device, UIQuad.positions.length, this.i / COMPONENTS_PER_UI_SPRITE);
    WebGL.submitRenderPass(this.device);

    this.i = 0;
  }
}
