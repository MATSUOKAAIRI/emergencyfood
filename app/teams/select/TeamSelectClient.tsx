'use client';
import { useAuth } from '@/hooks';
import { ERROR_MESSAGES } from '@/utils/constants';

export default function TeamSelectClient() {
  const { user: _user, loading } = useAuth(true);

  if (loading) {
    return <p>{ERROR_MESSAGES.LOADING}</p>;
  }
  return null;
}
