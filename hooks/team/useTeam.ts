import type { AppUser, Team, TeamMember } from '@/types';
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/utils/constants';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseTeamReturn {
  teamId: string | null;
  teamIdFromURL: string | null;
  currentTeamId: string | null;
  team: Team | null;
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  createTeam: (
    teamName: string,
    teamPassword: string
  ) => Promise<{ teamId?: string; message: string }>;
  joinTeam: (
    teamName: string,
    teamPassword: string
  ) => Promise<{ teamId?: string; message: string }>;
  addAdmin: (userId: string) => Promise<void>;
  removeAdmin: (userId: string) => Promise<void>;
  refreshTeam: () => Promise<void>;
  migrateTeamData: () => Promise<void>;
}

export const useTeam = (user: AppUser | null): UseTeamReturn => {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamIdFromURL, setTeamIdFromURL] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const teamIdParam = searchParams.get('teamId');
    setTeamIdFromURL(teamIdParam);
  }, [searchParams]);

  useEffect(() => {
    const getTeamIdFromClaims = async () => {
      if (!user) {
        setTeamId(null);
        setLoading(false);
        return;
      }

      try {
        const idTokenResult = await user.getIdTokenResult(true);
        const teamIdFromClaims =
          (idTokenResult.claims.teamId as string | null) || null;
        setTeamId(teamIdFromClaims);
      } catch (e) {
        setError('チームIDの取得に失敗しました');
        setTeamId(null);
      } finally {
        setLoading(false);
      }
    };

    getTeamIdFromClaims();
  }, [user]);

  useEffect(() => {
    setCurrentTeamId(teamIdFromURL || teamId);
  }, [teamIdFromURL, teamId]);

  const fetchTeamInfo = async () => {
    if (!currentTeamId || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/team/${currentTeamId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.TEAM_FETCH_FAILED);
      }

      const teamData = await response.json();
      setTeam(teamData.team);
      setTeamMembers(teamData.members);
    } catch (e) {
      setError(ERROR_MESSAGES.TEAM_FETCH_FAILED);
    }
  };

  const migrateTeamData = async () => {
    if (!currentTeamId || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(API_ENDPOINTS.MIGRATE_TEAM_DATA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          teamId: currentTeamId,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        return;
      }

      const result = await response.json();
      if (result.migrated) {
        await fetchTeamInfo();
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (currentTeamId) {
      fetchTeamInfo();
    }
  }, [currentTeamId]);

  const createTeam = async (teamName: string, teamPassword: string) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    const idToken = await user.getIdToken(true);
    const response = await fetch(API_ENDPOINTS.CREATE_TEAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        teamName,
        teamPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'チームの作成に失敗しました。');
    }

    return result;
  };

  const joinTeam = async (teamName: string, teamPassword: string) => {
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    const idToken = await user.getIdToken();
    const response = await fetch(API_ENDPOINTS.JOIN_TEAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        teamName,
        teamPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'チームへの参加に失敗しました。');
    }

    return result;
  };

  const addAdmin = async (userId: string) => {
    if (!currentTeamId || !user) {
      throw new Error('チームIDまたはユーザーが設定されていません');
    }

    const idToken = await user.getIdToken();
    const response = await fetch(API_ENDPOINTS.ADD_ADMIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        teamId: currentTeamId,
        userId,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || ERROR_MESSAGES.ADMIN_UPDATE_FAILED);
    }

    await fetchTeamInfo();
  };

  const removeAdmin = async (userId: string) => {
    if (!currentTeamId || !user) {
      throw new Error('チームIDまたはユーザーが設定されていません');
    }

    const idToken = await user.getIdToken();
    const response = await fetch(API_ENDPOINTS.REMOVE_ADMIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        teamId: currentTeamId,
        userId,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || ERROR_MESSAGES.ADMIN_UPDATE_FAILED);
    }

    await fetchTeamInfo();
  };

  const refreshTeam = async () => {
    await fetchTeamInfo();
  };

  return {
    teamId,
    teamIdFromURL,
    currentTeamId,
    team,
    teamMembers,
    loading,
    error,
    createTeam,
    joinTeam,
    addAdmin,
    removeAdmin,
    refreshTeam,
    migrateTeamData,
  };
};
