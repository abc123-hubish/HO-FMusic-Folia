import * as twgl from 'twgl.js';
import { parseColorChannels } from '../colorMix';
import { createWaveLightFrame, fillWaveLightFrame, WAVE_LIGHT_GLOW_COUNT, WAVE_LIGHT_RING_COUNT } from './waveLightGeometry';
import { WAVE_LIGHT_FRAGMENT, WAVE_LIGHT_VERTEX } from './waveLightShaders';

// src/components/visualizer/waveLight/waveLightWebGL.ts
// Two GPU submissions replace 30 per-frame Canvas gradient/shadow rasters, at the original DPR.
export const createWaveLightWebGL = (canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true,
        antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
    if (!gl) return null;
    const program = twgl.createProgramInfo(gl, [WAVE_LIGHT_VERTEX, WAVE_LIGHT_FRAGMENT], message => console.warn('[WaveLight]', message));
    if (!program) { gl.getExtension('WEBGL_lose_context')?.loseContext(); return null; }
    const frame = createWaveLightFrame();
    const shapeBuffer = gl.createBuffer();
    const styleBuffer = gl.createBuffer();
    if (!shapeBuffer || !styleBuffer) {
        gl.deleteBuffer(shapeBuffer); gl.deleteBuffer(styleBuffer); gl.deleteProgram(program.program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return null;
    }
    for (const buffer of [shapeBuffer, styleBuffer]) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, frame.shapes.byteLength, gl.DYNAMIC_DRAW);
    }
    const vertices = new Float32Array(129 * 4);
    for (let i = 0; i <= 128; i++) vertices.set([i / 128, -1, i / 128, 1], i * 4);
    const rings = twgl.createBufferInfoFromArrays(gl, { a_vertex: { numComponents: 2, data: vertices } });
    const glows = twgl.createBufferInfoFromArrays(gl, { a_vertex: { numComponents: 2, data: [-1, -1, 1, -1, -1, 1, 1, 1] } });
    for (const [info, offset] of [[rings, 0], [glows, WAVE_LIGHT_RING_COUNT * 16]] as const) {
        info.attribs!.a_shape = { buffer: shapeBuffer, numComponents: 4, type: gl.FLOAT, divisor: 1, offset };
        info.attribs!.a_style = { buffer: styleBuffer, numComponents: 4, type: gl.FLOAT, divisor: 1, offset };
    }
    const uniforms = { u_resolution: new Float32Array(2), u_color: new Float32Array(3), u_glow: false };
    let lastColor = '';
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);
    let disposed = false;
    return {
        draw(wave: string, seconds: number, brightness: number) {
            if (disposed) return;
            if (wave !== lastColor) {
                lastColor = wave;
                const color = parseColorChannels(wave) ?? { r: 95, g: 124, b: 255 };
                uniforms.u_color.set([color.r / 255, color.g / 255, color.b / 255]);
            }
            fillWaveLightFrame(frame, canvas.width, canvas.height, seconds, brightness);
            gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, frame.shapes);
            gl.bindBuffer(gl.ARRAY_BUFFER, styleBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, frame.styles);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            uniforms.u_resolution[0] = canvas.width; uniforms.u_resolution[1] = canvas.height;
            gl.useProgram(program.program);
            uniforms.u_glow = true;
            twgl.setBuffersAndAttributes(gl, program, glows);
            twgl.setUniforms(program, uniforms);
            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, WAVE_LIGHT_GLOW_COUNT);
            uniforms.u_glow = false;
            twgl.setBuffersAndAttributes(gl, program, rings);
            twgl.setUniforms(program, uniforms);
            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, vertices.length / 2, WAVE_LIGHT_RING_COUNT);
        },
        dispose(releaseContext = true) {
            if (disposed) return;
            disposed = true;
            gl.deleteBuffer(shapeBuffer); gl.deleteBuffer(styleBuffer);
            gl.deleteBuffer(rings.attribs!.a_vertex.buffer); gl.deleteBuffer(glows.attribs!.a_vertex.buffer);
            gl.deleteProgram(program.program);
            // Release the GPU context immediately on mode switch, rather than awaiting canvas GC.
            if (releaseContext) gl.getExtension('WEBGL_lose_context')?.loseContext();
        },
    };
};
