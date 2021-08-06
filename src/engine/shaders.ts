export const SPRITE_VS = `
precision mediump float;
uniform mat4 vp;
attribute vec2 qpos;
attribute vec2 uv;
varying vec2 vUv;
attribute vec3 position;
attribute float rotation;
attribute vec4 quad;
varying vec4 vQuad;
attribute vec4 color;
varying vec4 vColor;

const float PI = 3.14;

void main () {
  vec3 local = vec3(qpos.x * quad.z, qpos.y * quad.w, 0.);
  if (abs(rotation) > 1.) {
    local = vec3(
      cos(PI/2.) * local.x - sin(PI/2.) * local.y,
      sin(PI/2.) * local.x + cos(PI/2.) * local.y,
      0.
    );
  }
  float rot = rotation < 0. ? -1. : 1.;
  local.x = rot * local.x;
  gl_Position = vp * vec4(local + position, 1.);
  vUv = uv;
  vQuad = quad;
  vColor = color;
}
`;

export const SPRITE_FS = `
precision mediump float;
varying vec2 vUv;
varying vec4 vQuad;
varying vec4 vColor;
uniform vec2 texSize;
uniform sampler2D tex;

void main () {
  vec2 uv = vec2((vQuad.x + vUv.x * vQuad.z) / texSize.x, (vQuad.y + vUv.y * vQuad.w) / texSize.y);
  vec4 color = texture2D(tex, uv);
  if (color.a < 0.1) {
    discard;
  }
  gl_FragColor = vec4(mix(color.rgb, vColor.rgb, vColor.a), color.a);
}
`;
