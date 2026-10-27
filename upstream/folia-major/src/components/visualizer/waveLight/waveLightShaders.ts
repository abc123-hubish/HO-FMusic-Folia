// src/components/visualizer/waveLight/waveLightShaders.ts
// Thin instanced strips shade only the rings' own area; there is no full-screen ring search or blur pass.
export const WAVE_LIGHT_VERTEX = `#version 300 es
precision highp float;
in vec2 a_vertex;
in vec4 a_shape;
in vec4 a_style;
uniform vec2 u_resolution;
uniform bool u_glow;
out vec2 v_local;
flat out vec4 v_shape;
flat out vec4 v_style;
void main() {
    vec2 local;
    if (u_glow) local = a_vertex * a_shape.z;
    else {
        float angle = a_style.z + a_vertex.x * a_style.w;
        float extent = a_style.x * 0.5 + max(1.0, a_style.y * 1.5);
        local = vec2(cos(angle), sin(angle)) * max(0.0, a_shape.z + a_vertex.y * extent);
    }
    vec2 px = a_shape.xy + local;
    gl_Position = vec4(px.x / u_resolution.x * 2.0 - 1.0, 1.0 - px.y / u_resolution.y * 2.0, 0.0, 1.0);
    v_local = local;
    v_shape = a_shape;
    v_style = a_style;
}
`;
export const WAVE_LIGHT_FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_local;
flat in vec4 v_shape;
flat in vec4 v_style;
uniform vec3 u_color;
uniform bool u_glow;
out vec4 outColor;
void main() {
    float radius = max(v_shape.z, 1.0);
    float alpha;
    if (u_glow) {
        float t = clamp(length(v_local) / radius, 0.0, 1.0);
        float falloff = v_style.x > 0.5 ? 1.0 - t
            : (t < 0.55 ? mix(1.0, 0.4, t / 0.55) : mix(0.4, 0.0, (t - 0.55) / 0.45));
        alpha = v_shape.w * falloff;
    } else {
        float d = abs(length(v_local) - radius);
        float halfWidth = v_style.x * 0.5;
        float edge = max(fwidth(d), 0.65);
        float stroke = 1.0 - smoothstep(max(0.0, halfWidth - edge), halfWidth + edge, d);
        float soft = max(0.0, d - halfWidth) / max(v_style.y, 1.0);
        float halo = exp(-2.0 * soft * soft);
        float band = max(0.0, 1.0 - abs(v_local.y / radius));
        alpha = v_shape.w * band * (stroke + min(0.6, v_shape.w * 1.5) * halo);
    }
    outColor = vec4(u_color * alpha, alpha);
}
`;
