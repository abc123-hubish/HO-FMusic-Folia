// src/protocol/evidence.ts
//
// 一条错误码或分类规则「凭什么这样说」。零依赖，两个运行时共用。
export const EVIDENCE_LEVELS = [
    'verified-controlled',
    'existing-behavior',
    'observed-response',
    'protocol-reference',
    'third-party-report',
    'unknown',
];
export const isEvidenceLevel = (value) => typeof value === 'string' && EVIDENCE_LEVELS.includes(value);
