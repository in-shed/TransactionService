import { api } from './client';
import type {
  CustomerCreateRequest,
  CustomerResponse,
  CustomerSummary,
  CustomerUpdateRequest,
} from '../types';

export const customersApi = {
  getAll: () => api.get<CustomerSummary[]>('/customers'),

  get: (pNo: string) =>
    api.get<CustomerResponse>(`/customers/${encodeURIComponent(pNo)}`),

  create: (request: CustomerCreateRequest) =>
    api.post<CustomerResponse>('/customers', request),

  updateName: (pNo: string, request: CustomerUpdateRequest) =>
    api.patch<CustomerResponse>(
      `/customers/${encodeURIComponent(pNo)}`,
      request,
    ),

  delete: (pNo: string) =>
    api.delete<CustomerResponse>(`/customers/${encodeURIComponent(pNo)}`),
};