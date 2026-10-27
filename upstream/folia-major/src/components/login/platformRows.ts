import type { ProviderAccountSummary } from '../../types/onlineMusic';
// src/components/login/platformRows.ts
export type RowStatus = 'signed-in' | 'ran-out' | 'accountless' | 'off' | 'signed-out';
export const rowStatus = (row: ProviderAccountSummary): RowStatus => !row.availability.configured ? 'off' : row.requiresAccount === false ? 'accountless' : row.status === 'authenticated' ? 'signed-in' : row.status === 'error' ? 'ran-out' : 'signed-out';
