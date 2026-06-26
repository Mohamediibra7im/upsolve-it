import useSWR from 'swr';
import { apiFetcher } from '@/lib/apiClient';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAdminContactMessages() {
  const { data, error, mutate, isLoading } = useSWR<{ messages: ContactMessage[] }>(
    '/api/admin/contact',
    apiFetcher,
  );

  return {
    messages: data?.messages ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function markAsRead(id: string): Promise<void> {
  await apiFetcher(`/api/admin/contact/${id}/read`, { method: 'PATCH' });
}
