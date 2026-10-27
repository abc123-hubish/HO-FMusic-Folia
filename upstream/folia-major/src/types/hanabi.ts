// src/types/hanabi.ts
export interface HanabiTuning {
    /** 配色：跟随主题 / 预设自带的鲜艳配色 / 两者混合。 */
    colorMode: 'theme' | 'vivid' | 'mixed';
    /** 烟花粒子数量倍率 0..2。 */
    sparkAmount: number;
    /** MG 装饰件数量倍率 0..2。 */
    ornamentAmount: number;
    /** 文字动作幅度 0..2。 */
    textMotion: number;
    /** 字底色块不透明度 0..1。 */
    blockOpacity: number;
    /** 上升速度倍率 0..2（0 = 不上升，镜头原地切换）。 */
    riseSpeed: number;
    /** 旋转倍率 0..2：整个世界一直在转，镜头内约 11°/秒，镜头边界随上升再甩 34°–80°（都是 1 时），段落转场也带着转；0 = 不转。 */
    spin: number;
    /** 环境粒子（远处星点、火星、远方小烟花）0..2。 */
    ambient: number;
    /** 辉光（烟花与火花的 bloom）0..2。 */
    glow: number;
    /** 整体辉光：整个画面（不含夜空底）常驻的全屏 bloom 0..2；0 = 没有。 */
    bloom: number;
    /** 副歌辉光：副歌时段全屏 bloom 平滑亮起来的强度 0..2；0 = 副歌不亮。 */
    chorusBloom: number;
    /** 升空尾迹开关。 */
    launches: boolean;
    /** 画框装饰（角标、竖排小字）开关。 */
    overlayFrame: boolean;
    /** 仅显示歌词文字：烟花、装饰件、拼贴与夜空都不画。 */
    textOnly: boolean;
    /** 夜空底（运行时铺在所有场景之下的渐变）的不透明度 0..1；0 = 直接画在共享背景上。 */
    sky: number;
    /** PV 拼贴装饰（跑马灯色带、重复字、贴纸、胶带、拟声字）数量倍率 0..2。 */
    collage: number;
    /** 画质：均衡 / 省电降低烟花辉光的分辨率（字与全屏辉光仍按满分辨率），省电再少画一些环境粒子。 */
    renderQuality: HanabiRenderQuality;
}

export type HanabiRenderQuality = 'full' | 'balanced' | 'low';

export const DEFAULT_HANABI_TUNING: HanabiTuning = {
    colorMode: 'mixed',
    sparkAmount: 1,
    ornamentAmount: 1,
    textMotion: 1,
    blockOpacity: 1,
    riseSpeed: 1,
    spin: 1,
    ambient: 1,
    glow: 1,
    bloom: 0.8,
    chorusBloom: 1.3,
    launches: true,
    overlayFrame: true,
    textOnly: false,
    sky: 0.85,
    collage: 1,
    renderQuality: 'balanced',
};

