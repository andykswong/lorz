export class Model {
  public readonly indices: number[][] | null = null;
  public readonly positions: number[][] | null = null;
  public readonly uvs: number[][] | null = null;
}

export function toVertices(model: Model): Float32Array {
  const positions = model.positions;
  const uvs = model.uvs;

  let hasZ = false;
  let countPerVertex = 0;
  let length = 0;
  if (positions) {
    length = positions.length;
    hasZ = positions[0].length > 2;
    countPerVertex += hasZ ? 3 : 2;
  }
  if (uvs) {
    countPerVertex += 2;
  }

  const out = new Float32Array(countPerVertex * length);
  for (let i = 0; i < length; ++i) {
    let j = 0;
    if (positions) {
      out[i * countPerVertex + j++] = positions[i][0];
      out[i * countPerVertex + j++] = positions[i][1];
      hasZ && (out[i * countPerVertex + j++] = positions[i][2]);
    }
    if (uvs) {
      out[i * countPerVertex + j++] = uvs[i][0];
      out[i * countPerVertex + j++] = uvs[i][1];
    }
  }
  return out;
}

export function toIndices(model: Model): Uint16Array {
  const indices = model.indices;
  if (!indices) {
    return new Uint16Array(0);
  }
  const out = new Uint16Array(indices.length * 3);
  for (let i = 0; i < indices.length; ++i) {
    out[i * 3] = indices[i][0];
    out[i * 3 + 1] = indices[i][1];
    out[i * 3 + 2] = indices[i][2];
  }
  return out;
}

export const Quad: Model = {
  positions: [
    [-0.5, 0.0], [+0.5, +0.0], [+0.5, +1.0], // first triangle
    [-0.5, 0.0], [+0.5, +1.0], [-0.5, +1.0]  // second triangle
  ],
  uvs: [
    [0.0, 1.0], [1.0, 1.0], [1.0, 0.0],
    [0.0, 1.0], [1.0, 0.0], [0.0, 0.0]
  ]
} as Model;

export const UIQuad: Model = {
  positions: [
    [+0.0, 0.0], [+0.0, +1.0], [+1.0, +1.0], // first triangle
    [+0.0, 0.0], [+1.0, +1.0], [+1.0, +0.0]  // second triangle
  ],
  uvs: [
    [0.0, 0.0], [0.0, 1.0], [1.0, 1.0],
    [0.0, 0.0], [1.0, 1.0], [1.0, 0.0]
  ]
} as Model;
