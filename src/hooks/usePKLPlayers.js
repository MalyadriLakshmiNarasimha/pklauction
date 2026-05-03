import { useEffect, useState } from 'react';
import { getPKLPlayers } from '@/lib/mockData';

/**
 * Hook to fetch and cache enriched PKL players with stats
 * Provides loading, error, and data states
 */
export function usePKLPlayers() {
  const [players, setPlayers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const enrichedPlayers = await getPKLPlayers();
        if (isMounted) {
          setPlayers(enrichedPlayers);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading PKL players:', err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { players, loading, error };
}
