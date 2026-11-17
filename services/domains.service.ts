import { api } from '@/lib/api';
import type { Domain, DomainFacets, DomainStatistics, Paginated } from '@/types';
export const domainsService = {
  list: (params: Record<string, string>) => api.get<Paginated<Domain>>(`/domains?${new URLSearchParams(params).toString()}`),
  get: (id: string) => api.get<Domain>(`/domains/${id}`),
  create: (d: unknown) => api.post<Domain>('/domains', d),
  update: (id: string, d: unknown) => api.patch<Domain>(`/domains/${id}`, d),
  remove: (id: string) => api.delete(`/domains/${id}`),
  upcoming: () => api.get<Domain[]>('/domains/upcoming-expiries'),
  expired: () => api.get<Domain[]>('/domains/expired'),
  statistics: () => api.get<DomainStatistics>('/domains/statistics'),
  facets: () => api.get<DomainFacets>('/domains/projects'),
};
