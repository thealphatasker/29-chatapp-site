import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t = mod(uTime + t0, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(p, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}
`;

export default function MagicRings({
  color = "#7c3aed",
  colorTwo = "#06b6d4",
  speed = 1,
  ringCount = 4,
  attenuation = 12,
  lineThickness = 2,
  baseRadius = 0.28,
  radiusStep = 0.08,
  scaleRate = 0.08,
  opacity = 1,
  noiseAmount = 0.05,
  rotation = 0,
  ringGap = 1.5,
  fadeIn = 0.7,
  fadeOut = 0.5,
}) {
  const mountRef = useRef(null);
  const propsRef = useRef(null);
  propsRef.current = {
    color,
    colorTwo,
    speed,
    ringCount,
    attenuation,
    lineThickness,
    baseRadius,
    radiusStep,
    scaleRate,
    opacity,
    noiseAmount,
    rotation,
    ringGap,
    fadeIn,
    fadeOut,
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      uTime: { value: 0 },
      uAttenuation: { value: 12 },
      uResolution: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color() },
      uColorTwo: { value: new THREE.Color() },
      uLineThickness: { value: 2 },
      uBaseRadius: { value: 0.28 },
      uRadiusStep: { value: 0.08 },
      uScaleRate: { value: 0.08 },
      uRingCount: { value: 4 },
      uOpacity: { value: 1 },
      uNoiseAmount: { value: 0.05 },
      uRotation: { value: 0 },
      uRingGap: { value: 1.5 },
      uFadeIn: { value: 0.7 },
      uFadeOut: { value: 0.5 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseInfluence: { value: 0 },
      uHoverAmount: { value: 0 },
      uHoverScale: { value: 1 },
      uParallax: { value: 0 },
      uBurst: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(quad);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);
      uniforms.uResolution.value.set(w * dpr, h * dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let frameId;
    const animate = (t) => {
      frameId = requestAnimationFrame(animate);
      const p = propsRef.current;
      uniforms.uTime.value = t * 0.001 * p.speed;
      uniforms.uAttenuation.value = p.attenuation;
      uniforms.uColor.value.set(p.color);
      uniforms.uColorTwo.value.set(p.colorTwo);
      uniforms.uLineThickness.value = p.lineThickness;
      uniforms.uBaseRadius.value = p.baseRadius;
      uniforms.uRadiusStep.value = p.radiusStep;
      uniforms.uScaleRate.value = p.scaleRate;
      uniforms.uRingCount.value = p.ringCount;
      uniforms.uOpacity.value = p.opacity;
      uniforms.uNoiseAmount.value = p.noiseAmount;
      uniforms.uRotation.value = (p.rotation * Math.PI) / 180;
      uniforms.uRingGap.value = p.ringGap;
      uniforms.uFadeIn.value = p.fadeIn;
      uniforms.uFadeOut.value = p.fadeOut;
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
      renderer.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        borderRadius: "inherit",
        overflow: "hidden",
      }}
    />
  );
}
