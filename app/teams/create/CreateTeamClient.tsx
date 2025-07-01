'use client';
import CreateTeamForm from '@/components/teams/CreateTeamForm';
import { useAuth } from '@/hooks';
import { ERROR_MESSAGES } from '@/utils/constants';

export default function CreateTeamClient() {
  const { user, loading } = useAuth(true);

  if (loading) {
    return <p>{ERROR_MESSAGES.LOADING}</p>;
  }

  return <CreateTeamForm />;
}
