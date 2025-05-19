 export const fragmentShader = `
      uniform vec3 faceColor;
      uniform float borderThickness;
      uniform float borderRadius;
      varying vec2 vUv;
      
      float roundedRectSDF(vec2 p, vec2 b, float r) {
        vec2 d = abs(p) - b + vec2(r);
        return length(max(d, vec2(0.0))) - r;
      }
      
      void main() {
        vec2 p = vUv - vec2(0.5);
        vec2 innerHalfSize = vec2(0.5 - borderThickness);
        float sdf = roundedRectSDF(p, innerHalfSize, borderRadius);
        
        if (sdf < 0.0) {
          gl_FragColor = vec4(faceColor, 1.0);
        } else {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
      }
    `;