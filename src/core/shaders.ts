export const SPRITE_VS = `#version 300 es
precision mediump float;
layout(std140) uniform Data { mat4 vp; vec2 texSize; };
layout(location=0) in vec2 qpos;
layout(location=1) in vec2 uv;
layout(location=2) in vec4 quad;
layout(location=3) in vec3 position;
layout(location=4) in float dirAlpha;
layout(location=5) in vec4 color;
out vec2 vUv;
out vec4 vQuad;
out vec4 vColor;
out float alpha;

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

export const SPRITE_FS = `#version 300 es
precision mediump float;
layout(std140) uniform Data { mat4 vp; vec2 texSize; };
uniform sampler2D tex;
in vec2 vUv;
in vec4 vQuad;
in vec4 vColor;
in float alpha;
out vec4 outColor;

void main() {
  vec2 uv = vec2((vQuad.x + clamp(vUv.x, 0.01, 0.99) * vQuad.z) / texSize.x, (vQuad.y + clamp(vUv.y, 0.01, 0.99) * vQuad.w) / texSize.y);
  vec4 color = texture(tex, uv);
  if (color.a * alpha < 0.1) {
    discard;
  }
  outColor = vec4(mix(color.rgb, vColor.rgb, vColor.a), color.a * alpha);
}
`;

export const PARTICLE_VS = `#version 300 es
precision mediump float;
layout(std140) uniform Data { mat4 vp; float time; };
layout(location=0) in vec3 position;
layout(location=1) in vec3 velocity;
layout(location=2) in float lifetime;
layout(location=3) in vec4 color;
out vec4 vColor;
const float PI = 3.14;

void main() {
  float t = mod(time, lifetime);
  vColor = vec4(color.rgb, color.a * (1. - t / lifetime));
  vec3 pos = position + t * velocity + 0.5 * t * t * vec3(0, -10, 0);
  gl_Position = vp * vec4(pos, 1.);
  gl_PointSize = 1.0;
}
`;

export const PARTICLE_FS = `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 outColor;

void main() {
  outColor = vColor;
}
`;

export const UI_VS = `#version 300 es
precision mediump float;
layout(std140) uniform Data { mat4 vp; vec2 texSize; };
layout(location=0) in vec2 qpos;
layout(location=1) in vec2 uv;
layout(location=2) in vec4 quad;
layout(location=3) in vec2 position;
layout(location=4) in vec2 scale;
layout(location=5) in vec4 color;
out vec2 vUv;
out vec4 vQuad;
out vec4 vColor;

void main() {
  vec2 local = vec2(qpos.x * quad.z, qpos.y * quad.w) * scale;
  gl_Position = vp * vec4(local + position, 0., 1.);
  vUv = uv;
  vQuad = quad;
  vColor = color;
}
`;

export const UI_FS = `#version 300 es
precision mediump float;
layout(std140) uniform Data { mat4 vp; vec2 texSize; };
uniform sampler2D tex;
in vec2 vUv;
in vec4 vQuad;
in vec4 vColor;
out vec4 outColor;

void main() {
  vec2 uv = vec2((vQuad.x + vUv.x * vQuad.z) / texSize.x, (vQuad.y + vUv.y * vQuad.w) / texSize.y);
  vec4 color = texture(tex, uv);
  if (color.a < 0.1) {
    discard;
  }
  outColor = vec4(mix(color.rgb, vColor.rgb, vColor.a), color.a);
}
`;
