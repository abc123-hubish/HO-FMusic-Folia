import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { transformWithOxc } from 'vite';

// test/manual/wave-light-performance.mjs
// Same-browser before/after comparison; submission cost is NOT a device/GPU execution measurement.
const baselinePath = process.argv[2];
if (!baselinePath) throw new Error('Pass the backed-up waveLightDraw.ts path as the first argument.');
const origin = 'http://127.0.0.1:4173';
const before = (await transformWithOxc((await readFile(baselinePath, 'utf8'))
    .replace("'../colorMix'", `'${origin}/src/components/visualizer/colorMix.ts'`), 'baseline.ts')).code;
const baselineUrl = `data:text/javascript;base64,${Buffer.from(before).toString('base64')}`;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.route('**/__wave_light_benchmark__', route => route.fulfill({ contentType: 'text/html', body: '<html><body style="margin:0;background:#120b20"></body></html>' }));
    await page.goto(`${origin}/__wave_light_benchmark__`);
    const results = await page.evaluate(async ({ baselineUrl, origin }) => {
        const baseline = await import(/* @vite-ignore */ baselineUrl);
        const current = await import(/* @vite-ignore */ `${origin}/src/components/visualizer/waveLight/waveLightWebGL.ts`);
        const percentile = (values, fraction) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * fraction)];
        const runs = [];
        for (const mode of ['before', 'after', 'after', 'before']) {
            const canvas = document.createElement('canvas');
            canvas.width = 2240; canvas.height = 1260;
            canvas.style.cssText = 'width:1280px;height:720px;position:fixed;inset:0';
            document.body.append(canvas);
            const renderer = mode === 'after' ? current.createWaveLightWebGL(canvas) : null;
            if (mode === 'after' && !renderer) throw new Error('GPU renderer unavailable');
            const context = mode === 'before' ? canvas.getContext('2d') : null;
            const gl = mode === 'after' ? canvas.getContext('webgl2') : null;
            const debug = gl?.getExtension('WEBGL_debug_renderer_info');
            const backend = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'Canvas2D';
            const submissions = [], intervals = [];
            let previous = null;
            for (let i = 0; i < 140; i++) {
                const timestamp = await new Promise(requestAnimationFrame);
                const start = performance.now();
                if (renderer) renderer.draw('#aa69ee', 12 + i / 60, 1);
                else baseline.drawWaveLight(context, '#aa69ee', 12 + i / 60, 1);
                const cost = performance.now() - start;
                if (i >= 20) { submissions.push(cost); intervals.push(timestamp - previous); }
                previous = timestamp;
            }
            runs.push({ mode, backend, frames: submissions.length,
                submitMedianMs: percentile(submissions, .5), submitP95Ms: percentile(submissions, .95),
                frameMedianMs: percentile(intervals, .5), frameP95Ms: percentile(intervals, .95),
                meanFrameMs: intervals.reduce((a, b) => a + b, 0) / intervals.length,
                slowFramesOver25ms: intervals.filter(value => value > 25).length });
            renderer?.dispose(); gl?.getExtension('WEBGL_lose_context')?.loseContext();
            canvas.width = 1; canvas.height = 1; canvas.remove();
        }
        return { cssSize: [1280, 720], backingSize: [2240, 1260], userAgent: navigator.userAgent, runs };
    }, { baselineUrl, origin });
    const output = new URL('../../../../verification/wave-light-20261027/performance.json', import.meta.url);
    await mkdir(new URL('.', output), { recursive: true });
    await writeFile(output, JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
