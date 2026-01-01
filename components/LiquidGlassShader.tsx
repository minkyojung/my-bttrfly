import * as THREE from 'three';

// Vertex Shader
export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
export const fragmentShader = `
  uniform sampler2D uBackground;
  uniform float uTime;
  uniform float uRefractionStrength;
  uniform float uBlurAmount;
  uniform vec2 uResolution;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Fresnel effect calculation
  float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
  }

  // Simple noise function for surface variation
  float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Box blur for glass effect
  vec4 blur(sampler2D tex, vec2 uv, float amount) {
    vec4 color = vec4(0.0);
    float total = 0.0;

    // 3x3 box blur
    for(float x = -1.0; x <= 1.0; x++) {
      for(float y = -1.0; y <= 1.0; y++) {
        vec2 offset = vec2(x, y) * amount;
        color += texture2D(tex, uv + offset);
        total += 1.0;
      }
    }

    return color / total;
  }

  void main() {
    // 1. Calculate view direction
    vec3 viewDir = normalize(-vPosition);

    // 2. Add subtle surface noise for glass texture
    float noiseValue = noise(vUv * 10.0 + uTime * 0.1) * 0.02;
    vec3 normal = normalize(vNormal + vec3(noiseValue));

    // 3. Calculate refraction
    float ior = 1.5; // Index of refraction for glass
    vec3 refracted = refract(-viewDir, normal, 1.0 / ior);

    // 4. Distort UV coordinates based on refraction
    vec2 distortedUv = vUv + refracted.xy * uRefractionStrength;

    // Keep UV in bounds
    distortedUv = clamp(distortedUv, 0.0, 1.0);

    // 5. Sample background with blur
    vec4 refractedColor = blur(uBackground, distortedUv, uBlurAmount);

    // 6. Calculate Fresnel for edge highlights
    float fresnelFactor = fresnel(viewDir, normal, 3.0);

    // 7. Add specular highlights
    vec3 reflectDir = reflect(-viewDir, normal);
    float spec = pow(max(dot(reflectDir, vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
    vec4 specColor = vec4(1.0) * spec * 0.3;

    // 8. Mix refracted color with fresnel edge glow
    vec4 finalColor = mix(refractedColor, vec4(1.0), fresnelFactor * 0.1);

    // 9. Add specular highlights
    finalColor += specColor;

    // 10. Add slight glass tint (cool blue-ish)
    finalColor.rgb = mix(finalColor.rgb, vec3(0.9, 0.95, 1.0), 0.05);

    // 11. Slight transparency for glass feel
    finalColor.a = 0.95;

    gl_FragColor = finalColor;
  }
`;

// Shader uniforms
export const createLiquidGlassUniforms = (backgroundTexture: THREE.Texture) => ({
  uBackground: { value: backgroundTexture },
  uTime: { value: 0 },
  uRefractionStrength: { value: 0.05 },
  uBlurAmount: { value: 0.002 },
  uResolution: { value: new THREE.Vector2(1024, 1024) }
});
