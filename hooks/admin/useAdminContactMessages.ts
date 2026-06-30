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

export async function replyMessage(id: string, body: string): Promise<void> {
  await apiFetcher(`/api/admin/contact/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: body }),
  });
}

export async function deleteMessage(id: string): Promise<void> {
  await apiFetcher(`/api/admin/contact/${id}`, { method: 'DELETE' });
}
