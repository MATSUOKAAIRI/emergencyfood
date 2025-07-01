'use client';
import JoinTeamForm from '@/components/teams/JoinTeamForm';
import { useAuth } from '@/hooks';
import { ERROR_MESSAGES } from '@/utils/constants';

export default function JoinTeamClient() {
  const { user: _user, loading } = useAuth(true);

  if (loading) {
    return <p>{ERROR_MESSAGES.LOADING}</p>;
  }

  return <JoinTeamForm />;
}
