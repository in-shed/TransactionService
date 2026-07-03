import { api } from './client';
import type { TransactionResponse } from '../types';

export const transactionsApi = {
  getAll: (pNo: string, accountId: number) =>
    api.get<TransactionResponse[]>(
      `/customers/${encodeURIComponent(pNo)}/accounts/${accountId}/transactions`,
    ),
};