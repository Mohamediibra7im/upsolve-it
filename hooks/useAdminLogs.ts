import useSWR from 'swr';
import { apiFetcher } from '@/lib/apiClient';

export interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy: {
    _id: string;
    codeforcesHandle: string;
    avatar?: string;
  };
  performedByHandle: string;
  details: Record<string, any>;
  createdAt: string;
}

interface AdminLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export function useAdminLogs(params: {
  limit?: number;
  offset?: number;
  action?: string;
  entity?: string;
  performedByHandle?: string;
} = {}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());
  if (params.action) queryParams.set('action', params.action);
  if (params.entity) queryParams.set('entity', params.entity);
  if (params.performedByHandle) queryParams.set('performedByHandle', params.performedByHandle);

  const { data, error, mutate, isLoading } = useSWR<AdminLogsResponse>(
    `/api/admin/logs?${queryParams.toString()}`,
    apiFetcher
  );

  return {
    logs: data?.logs || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}
