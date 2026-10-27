import type { ProviderAccountSummary } from '../../../types/onlineMusic';
// src/components/login/window/loginView.ts
export type StepMark = 'code' | 'browser' | 'phone' | 'account';
export type LoginCaseKind = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type LoginScene = 'preparing' | 'none' | 'methods' | 'account' | 'accountless' | 'failed' | 'code' | 'browser-ready' | 'browser' | 'reading' | 'scanned';
export const filterRows = (rows: ProviderAccountSummary[], query: string) => rows.filter(row => `${row.shortName} ${row.displayName} ${row.user?.nickname ?? ''}`.toLowerCase().includes(query.toLowerCase()));
