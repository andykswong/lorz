import { BlendFactor, Buffer, FilterMode, MinFilterMode, Pipeline, ReadonlyColor, RenderingDevice, RenderPass, ShaderType, Texture, UniformFormat, UniformType, Usage, VertexFormat } from 'mugl';
import { array, ReadonlyMat4, ReadonlyVec2, ReadonlyVec4, vec2, Vec2 } from 'munum';
import { UISprite } from '../game/config';
import { toVertices, UIQuad } from './model';
import {UI_FS, UI_VS } from './shaders';

const tmpV2: Vec2 = vec2.create();

const COLOR_NONE: ReadonlyColor = [0, 0, 0, 0];
const QUAT_VERT = toVertices(UIQuad);

export const COMPONENTS_PER_UI_SPRITE = 12;

export class UIRenderer {
  private pipeline: Pipeline | null = null;
  private pass: RenderPass | null = null;
  private buffer: Buffer | null = null;
  private instBuffer: Buffer | null = null;
  private tex: Texture | null = null;
  private _init = false;
  private data: Float32Array;
  protected i = 0;

  public constructor(
    private readonly device: RenderingDevice,
    private max = 8 * 8 * 5
  ) {
    this.data = new Float32Array(COMPONENTS_PER_UI_SPRITE * max);
  }
  
  public init(): void {
    if (this._init) {
      return;
    }
    this._init = true;

    this.buffer = this.device.buffer({
      size: QUAT_VERT.byteLength
    }).data(QUAT_VERT);
    
    this.instBuffer = this.device.buffer({
      usage: Usage.Stream,
      size: this.data.byteLength
    });

    this.tex = this.device.texture({
      width: 128,
      height: 64
    }, {
      minFilter: MinFilterMode.Nearest,
      magFilter: FilterMode.Nearest
    }).data({
      image: document.getElementById('sprites') as TexImageSource
    });

    const vert = this.device.shader({ type: ShaderType.Vertex, source: UI_VS });
    const frag = this.device.shader({ type: ShaderType.Fragment, source: UI_FS });

    this.pipeline = this.device.pipeline({
      vert,
      frag,
      buffers: [{
        attrs: [
          { name: 'qpos', format: VertexFormat.Float2 },
          { name: 'uv', format: VertexFormat.Float2 }
        ]
      }, {
        attrs: [
          { name: 'quad', format: VertexFormat.Float4 },
          { name: 'position', format: VertexFormat.Float2 },
          { name: 'scale', format: VertexFormat.Float2 },
          { name: 'color', format: VertexFormat.Float4 }
        ],
        instanced: true
      }],
      uniforms: [
        { name: 'vp', valueFormat: UniformFormat.Mat4 },
        { name: 'tex', type: UniformType.Tex, texType: this.tex!.props.type },
        { name: 'texSize', valueFormat: UniformFormat.Vec2 },
      ],
      blend: {
        srcFactorRGB: BlendFactor.SrcAlpha,
        dstFactorRGB: BlendFactor.OneMinusSrcAlpha,
        srcFactorAlpha: BlendFactor.One,
        dstFactorAlpha: BlendFactor.OneMinusSrcAlpha,
      }
    })

    vert.destroy();
    frag.destroy();

    this.pass = this.device.pass();
  }

  public submitText(text: string, pos: ReadonlyVec2, color: ReadonlyColor, align: number = -1, scale: ReadonlyVec2 = [1, 1]): void {
    tmpV2[0] = pos[0] + (align > 0 ? -(4 * text.length - 1) : 0);
    tmpV2[1] = pos[1];
    for (let i = 0; i < text.length; ++i, tmpV2[0] += 4 * scale[0]) {
      if (text[i] == ' ') {
        tmpV2[0] += scale[0];
        ++i;
      }
      this.submit(UISprite[text[i]], tmpV2, scale, color);
    }
  }

  public submit(quad: ReadonlyVec4, pos: ReadonlyVec2, scale: ReadonlyVec2, color: ReadonlyColor = COLOR_NONE): void {
    if (this.i + COMPONENTS_PER_UI_SPRITE >= this.max * COMPONENTS_PER_UI_SPRITE) {
      console.error('Buffer overflow');
    }
    array.copy(quad, this.data, 0, this.i, 4); this.i += 4;
    array.copy(pos, this.data, 0, this.i, 3); this.i += 2;
    array.copy(scale, this.data, 0, this.i, 3); this.i += 2;
    array.copy(color, this.data, 0, this.i, 4); this.i += 4;
  }

  public render(viewProj: ReadonlyMat4): void {
    this.instBuffer!.data(this.data);
    this.device.render(this.pass!)
      .pipeline(this.pipeline!)
      .vertex(0, this.buffer!)
      .vertex(1, this.instBuffer!)
      .uniforms([
        { name: 'vp', values: viewProj },
        { name: 'tex', tex: this.tex },
        { name: 'texSize', values: [this.tex!.props.width, this.tex!.props.height] },
      ])
      .draw(UIQuad.positions!.length, this.i / COMPONENTS_PER_UI_SPRITE)
      .end();
    this.i = 0;
  }
}
