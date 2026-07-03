import { api } from './client';
import type {
  AccountCloseResponse,
  AccountResponse,
  AmountRequest,
} from '../types';

const base = (pNo: string) =>
  `/customers/${encodeURIComponent(pNo)}/accounts`;

export const accountsApi = {
  get: (pNo: string, accountId: number) =>
    api.get<AccountResponse>(`${base(pNo)}/${accountId}`),

  createSavings: (pNo: string) =>
    api.post<AccountResponse>(`${base(pNo)}/savings`),

  createCredit: (pNo: string) =>
    api.post<AccountResponse>(`${base(pNo)}/credit`),

  deposit: (pNo: string, accountId: number, request: AmountRequest) =>
    api.post<AccountResponse>(
      `${base(pNo)}/${accountId}/deposit`,
      request,
    ),

  withdraw: (pNo: string, accountId: number, request: AmountRequest) =>
    api.post<AccountResponse>(
      `${base(pNo)}/${accountId}/withdraw`,
      request,
    ),

  close: (pNo: string, accountId: number) =>
    api.delete<AccountCloseResponse>(`${base(pNo)}/${accountId}`),
};