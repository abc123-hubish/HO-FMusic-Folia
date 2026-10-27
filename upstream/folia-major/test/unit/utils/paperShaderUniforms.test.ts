import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { updatePaperShaderUniforms, type PaperShaderMount } from '@/utils/paperShaderUniforms';

// test/unit/utils/paperShaderUniforms.test.ts
// updatePaperShaderUniforms 依赖 paper-shaders 的 setUniformValues（类型声明里是 private）。
// 升级 paper-shaders 时如果它被改名或删掉，这里先失败，提醒去看 utils/paperShaderUniforms.ts。

const fakeMount = () => {
    const mount = {
        setUniforms: vi.fn(),
        setUniformValues: vi.fn(),
    };
    return mount;
};

describe('updatePaperShaderUniforms', () => {
    it('运行中的着色器只写 uniform，不调用会当场重绘的 setUniforms', () => {
        const mount = fakeMount();
        updatePaperShaderUniforms(mount as unknown as PaperShaderMount, { u_progress: 0.5 }, true);
        expect(mount.setUniformValues).toHaveBeenCalledWith({ u_progress: 0.5 });
        expect(mount.setUniforms).not.toHaveBeenCalled();
    });

    it('停着的着色器没有帧循环，仍走 setUniforms 立即重绘', () => {
        const mount = fakeMount();
        updatePaperShaderUniforms(mount as unknown as PaperShaderMount, { u_progress: 0.5 }, false);
        expect(mount.setUniforms).toHaveBeenCalledWith({ u_progress: 0.5 });
        expect(mount.setUniformValues).not.toHaveBeenCalled();
    });

    it('没有 setUniformValues 时退回 setUniforms', () => {
        const mount = { setUniforms: vi.fn() };
        updatePaperShaderUniforms(mount as unknown as PaperShaderMount, { u_progress: 0.5 }, true);
        expect(mount.setUniforms).toHaveBeenCalledWith({ u_progress: 0.5 });
    });

    it('安装的 paper-shaders 仍然提供 setUniformValues', () => {
        const require = createRequire(import.meta.url);
        const entry = require.resolve('@paper-design/shaders');
        const source = readFileSync(join(dirname(entry), 'shader-mount.js'), 'utf8');
        expect(source).toMatch(/\bsetUniformValues\s*=\s*\(/);
        expect(source).toContain('this.uniformCache[key] = cacheValue');
    });

    it('稳定的标量不重复重绘，外部设置写入后立即恢复更新', () => {
        const uniformCache: Record<string, unknown> = {};
        const mount = {
            uniformCache,
            setUniforms: vi.fn((values: Record<string, unknown>) => Object.assign(uniformCache, values)),
        };
        const shader = mount as unknown as PaperShaderMount;
        updatePaperShaderUniforms(shader, { u_progress: 0.5 }, false);
        for (let i = 0; i < 120; i += 1) updatePaperShaderUniforms(shader, { u_progress: 0.5 }, false);
        expect(mount.setUniforms).toHaveBeenCalledTimes(1);
        uniformCache.u_progress = 0.2;
        updatePaperShaderUniforms(shader, { u_progress: 0.5 }, false);
        expect(mount.setUniforms).toHaveBeenCalledTimes(2);
        expect(uniformCache.u_progress).toBe(0.5);
    });

    it('暂停时仍绘制已上传的最后一帧，恢复动画也写入一次', () => {
        const uniformCache: Record<string, unknown> = {};
        const mount = {
            uniformCache,
            setUniformValues: vi.fn((values: Record<string, unknown>) => Object.assign(uniformCache, values)),
            setUniforms: vi.fn((values: Record<string, unknown>) => Object.assign(uniformCache, values)),
        };
        const shader = mount as unknown as PaperShaderMount;
        updatePaperShaderUniforms(shader, { u_progress: 0.5 }, true);
        updatePaperShaderUniforms(shader, { u_progress: 0.5 }, true);
        expect(mount.setUniformValues).toHaveBeenCalledTimes(1);
        updatePaperShaderUniforms(shader, { u_progress: 0.5 }, false);
        updatePaperShaderUniforms(shader, { u_progress: 0.5 }, false);
        expect(mount.setUniforms).toHaveBeenCalledTimes(1);
        updatePaperShaderUniforms(shader, { u_progress: 0.5 }, true);
        expect(mount.setUniformValues).toHaveBeenCalledTimes(2);
    });

    it('不缓存可变数组，缺少内部缓存时保持兼容写入', () => {
        const values = [1, 2];
        const mount = { uniformCache: { u_vector: values }, setUniforms: vi.fn() };
        updatePaperShaderUniforms(mount as unknown as PaperShaderMount, { u_vector: values }, false);
        values[0] = 3;
        updatePaperShaderUniforms(mount as unknown as PaperShaderMount, { u_vector: values }, false);
        expect(mount.setUniforms).toHaveBeenCalledTimes(2);
        const fallback = { setUniforms: vi.fn() };
        updatePaperShaderUniforms(fallback as unknown as PaperShaderMount, { u_progress: 1 }, false);
        updatePaperShaderUniforms(fallback as unknown as PaperShaderMount, { u_progress: 1 }, false);
        expect(fallback.setUniforms).toHaveBeenCalledTimes(2);
    });
});
