/**
 * Star sprites as instanced screen-space quads (one draw per field). Quads,
 * not gl.POINTS: the brightest halos and focal glows exceed the point-size
 * cap on some GPUs. Sizes are CSS px from spec §4, scaled by DPR.
 *
 * Halo layers mimic the CSS box-shadow recipe `0 0 blur spread colour`:
 * a disc of radius (core/2 + spread) blurred with sigma ≈ blur/2.
 */
const common = /* glsl */ `
  uniform vec2 uViewport;   // drawing buffer px
  uniform float uDpr;
  uniform float uTime;
  // A disc of \`radius\` blurred with sigma: ~1 inside, 0.5 at the edge, gone by +2 sigma.
  float shadow(float r, float radius, float sigma) {
    return 1.0 - smoothstep(radius - 2.0 * sigma, radius + 2.0 * sigma, r);
  }
`;

export const backgroundVert = /* glsl */ `
  ${common}
  uniform vec2 uOffset;      // near-layer parallax/drift in px (clip-space direction)
  uniform float uTwinkleMag; // stars with mag below this twinkle
  uniform float uTwinkleCap; // amplitude cap (mobile / low power ±4%)
  attribute vec3 aPos;
  attribute float aMag;
  attribute vec3 aTint;
  attribute float aLayer;
  attribute vec4 aTw;        // amplitude, period 1, period 2, phase
  varying vec2 vPx;
  varying float vCore;
  varying float vOp;
  varying float vMag;
  varying float vTw;
  varying float vGlint;
  varying vec3 vTint;
  void main() {
    float m = aMag;
    float c = 1.1 + (1.0 - m) * 2.6;
    float glint = m < 0.12 ? 10.0 + (0.12 - m) * 160.0 : 0.0;
    float ext = m > 0.75 ? c * 0.5 + 1.5 : max(c * 9.0, glint * 0.5 + 2.0);
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(aPos, 1.0);
    vec2 px = position.xy * ext;
    clip.xy += (px + (aLayer - 1.0) * uOffset) * uDpr * 2.0 / uViewport * clip.w;
    gl_Position = clip;
    vPx = px;
    vCore = c;
    vOp = 0.5 + (1.0 - m) * 0.5;
    vMag = m;
    vGlint = glint;
    vTint = aTint;
    float amp = m < uTwinkleMag ? min(aTw.x, uTwinkleCap) : 0.0;
    vTw = amp * (0.6 * sin(6.2831853 * uTime / aTw.y + aTw.w) + 0.4 * sin(6.2831853 * uTime / aTw.z + aTw.w * 1.7));
  }
`;

export const backgroundFrag = /* glsl */ `
  ${common}
  uniform float uGlintRot;
  varying vec2 vPx;
  varying float vCore;
  varying float vOp;
  varying float vMag;
  varying float vTw;
  varying float vGlint;
  varying vec3 vTint;
  void main() {
    float r = length(vPx);
    float c = vCore;
    vec3 col;
    if (vMag > 0.75) {
      // Faint pinprick: a tinted dot, no halo.
      col = vTint * vOp * (1.0 - smoothstep(c * 0.5 - 0.5, c * 0.5 + 0.5, r));
    } else {
      float core = 1.0 - smoothstep(c * 0.5 - 0.6, c * 0.5 + 0.6, r);
      float w = shadow(r, c * 0.9, c * 0.6) * vOp;               // 1.2c blur, 0.4c spread, white
      float h2 = shadow(r, c * 1.7, c * 1.5) * vOp * 0.75;       // 3c blur, 1.2c spread, tint
      float h3 = shadow(r, c * 3.0, c * 3.5) * vOp * 0.28;       // 7c blur, 2.5c spread, tint
      float tw = 1.0 + vTw;
      col = vec3(1.0) * max(core, w) + vTint * (h2 + h3) * tw;
      if (vGlint > 0.0) {
        float s = sin(uGlintRot), k = cos(uGlintRot);
        vec2 q = abs(mat2(k, -s, s, k) * vPx);
        float half_ = vGlint * 0.5;
        float a = (1.0 - smoothstep(0.0, 0.9, q.y)) * (1.0 - q.x / half_);
        float b = (1.0 - smoothstep(0.0, 0.9, q.x)) * (1.0 - q.y / half_);
        col += vTint * 0.55 * max(max(a, b), 0.0);
      }
    }
    if (max(col.r, max(col.g, col.b)) < 0.002) discard;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const contentVert = /* glsl */ `
  ${common}
  attribute vec3 aPos;
  attribute vec3 aTint;
  attribute vec4 aState;    // core px, halo gain, focal glow 0–1, twinkle phase
  varying vec2 vPx;
  varying vec4 vState;
  varying vec3 vTint;
  varying float vTw;
  void main() {
    float c = aState.x;
    float ext = mix(c * 0.5 + 14.0 + 60.0, 300.0, step(0.001, aState.z));
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(aPos, 1.0);
    vec2 px = position.xy * ext;
    clip.xy += px * uDpr * 2.0 / uViewport * clip.w;
    gl_Position = clip;
    vPx = px;
    vState = aState;
    vTint = aTint;
    vTw = 0.04 * sin(6.2831853 * uTime / 3.5 + aState.w);
  }
`;

export const contentFrag = /* glsl */ `
  ${common}
  uniform float uTwinkle;
  varying vec2 vPx;
  varying vec4 vState;
  varying vec3 vTint;
  varying float vTw;
  void main() {
    float r = length(vPx);
    float c = vState.x;
    float halo = vState.y * (1.0 + vTw * uTwinkle);
    float core = 1.0 - smoothstep(c * 0.5 - 0.7, c * 0.5 + 0.7, r);
    float w = shadow(r, c * 0.5 + 2.0, 3.0);                    // 0 0 6px 2px #FFF
    float h2 = shadow(r, c * 0.5 + 6.0, 8.0) * 0.8;             // 0 0 16px 6px tint@0.8
    float h3 = shadow(r, c * 0.5 + 14.0, 20.0) * 0.3;           // 0 0 40px 14px tint@0.3
    float g = 1.0 - clamp(r / 280.0, 0.0, 1.0);
    float glow = vState.z * 0.3 * g * g;                       // focal 240–300 px radial glow
    vec3 col = vec3(1.0) * max(core, w * min(halo, 1.2)) + vTint * ((h2 + h3) * halo + glow);
    if (max(col.r, max(col.g, col.b)) < 0.002) discard;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const nebulaVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** One soft blue-violet ellipse, #2A2F6B at 45% (spec §3), breathing via uniforms. */
export const nebulaFrag = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float d = dot(p, p);
    float a = exp(-d * 3.2) * uOpacity;
    gl_FragColor = vec4(vec3(0.165, 0.184, 0.420) * a, 1.0);
  }
`;
