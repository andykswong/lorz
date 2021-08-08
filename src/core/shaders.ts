export const SPRITE_VS = `
precision mediump float;
uniform mat4 vp;

attribute vec2 qpos;
attribute vec2 uv;
varying vec2 vUv;
attribute vec3 position;
attribute float dirAlpha;
attribute vec4 quad;
varying vec4 vQuad;
attribute vec4 color;
varying vec4 vColor;
varying float alpha;

void main () {
  vec3 local = vec3(qpos.x * quad.z, qpos.y * quad.w, 0.);
  float rot = dirAlpha < 0. ? -1. : 1.;
  local.x = rot * local.x;
  gl_Position = vp * vec4(local + position, 1.);
  vUv = uv;
  vQuad = quad;
  vColor = color;
  alpha = abs(dirAlpha);
}
`;

export const SPRITE_FS = `
precision mediump float;
uniform vec2 texSize;
uniform sampler2D tex;

varying vec2 vUv;
varying vec4 vQuad;
varying vec4 vColor;
varying float alpha;

void main () {
  vec2 uv = vec2((vQuad.x + clamp(vUv.x, 0.01, 0.99) * vQuad.z) / texSize.x, (vQuad.y + clamp(vUv.y, 0.01, 0.99) * vQuad.w) / texSize.y);
  vec4 color = texture2D(tex, uv);
  if (color.a * alpha < 0.1) {
    discard;
  }
  gl_FragColor = vec4(mix(color.rgb, vColor.rgb, vColor.a), color.a * alpha);
}
`;

export const PARTICLE_VS = `
precision mediump float;
uniform mat4 vp;
uniform float time;

attribute vec3 position;
attribute vec3 velocity;
attribute float lifetime;
attribute vec4 color;
varying vec4 vColor;

const float PI = 3.14;

void main () {
  float t = mod(time, lifetime);
  vColor = vec4(color.rgb, color.a * (1. - t / lifetime));
  vec3 pos = position + t * velocity + 0.5 * t * t * vec3(0, -10, 0);
  gl_Position = vp * vec4(pos, 1.);
  gl_PointSize = 1.0;
}
`;

export const PARTICLE_FS = `
precision mediump float;
varying vec4 vColor;

void main () {
  gl_FragColor = vColor;
}
`;

export const UI_VS = `
precision mediump float;
uniform mat4 vp;

attribute vec2 qpos;
attribute vec2 uv;
varying vec2 vUv;
attribute vec2 position;
attribute vec2 scale;
attribute vec4 quad;
varying vec4 vQuad;
attribute vec4 color;
varying vec4 vColor;

void main () {
  vec2 local = vec2(qpos.x * quad.z, qpos.y * quad.w) * scale;
  gl_Position = vp * vec4(local + position, 0., 1.);
  vUv = uv;
  vQuad = quad;
  vColor = color;
}
`;

export const UI_FS = `
precision mediump float;
uniform vec2 texSize;
uniform sampler2D tex;

varying vec2 vUv;
varying vec4 vQuad;
varying vec4 vColor;

void main () {
  vec2 uv = vec2((vQuad.x + vUv.x * vQuad.z) / texSize.x, (vQuad.y + vUv.y * vQuad.w) / texSize.y);
  vec4 color = texture2D(tex, uv);
  if (color.a < 0.1) {
    discard;
  }
  gl_FragColor = vec4(mix(color.rgb, vColor.rgb, vColor.a), color.a);
}
`;
