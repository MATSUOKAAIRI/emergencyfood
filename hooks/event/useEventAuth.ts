'use client';
import { useEffect, useState } from 'react';

interface EventUser {
  eventUserId: string;
  name: string;
  teamId: string;
  isEventUser: boolean;
  expiresAt: string;
}

interface UseEventAuthReturn {
  eventUser: EventUser | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

export const useEventAuth = (): UseEventAuthReturn => {
  const [eventUser, setEventUser] = useState<EventUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEventSession = async () => {
      try {
        const response = await fetch('/api/event/session');
        if (response.ok) {
          const data = await response.json();
          if (data.eventUser) {
            const expiresAt = new Date(data.eventUser.expiresAt);
            if (expiresAt > new Date()) {
              setEventUser(data.eventUser);
            } else {
              await fetch('/api/event/logout', { method: 'POST' });
            }
          }
        }
      } catch (error) {
        console.error('Event session check error:', error);
        setError('セッションの確認に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    checkEventSession();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/event/logout', { method: 'POST' });
      setEventUser(null);
    } catch (error) {
      console.error('Event logout error:', error);
    }
  };

  return {
    eventUser,
    loading,
    error,
    logout,
  };
};
