// hooks/useGlobalSearch.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthData } from '../../hooks/useAuthData';
import { checkPermission } from '../../utils/utils';
import { Api } from '../../lib/api';


// types/globalSearch.types.ts

export interface GlobalSearchResult {
  type: string;
  _id: string;
  uniqueId: string;
  title: string;
  subtitle?: string;
  path: string;
  icon: string;
}

export interface GlobalSearchResponse {
  ok: boolean;
  data: GlobalSearchResult[];
  message?: string;
}

// Small internal debounce so the hook owns timing, not the component
const useDebouncedValue = (value: string, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export const useGlobalSearch = (schoolId: string | undefined, query: string) => {
  const { currentRole } = useAuthData();
  const debouncedQuery = useDebouncedValue(query.trim(), 250);

  const isQueryValid = debouncedQuery.length >= 2;

  const result = useQuery({
    queryKey: ['global-search', schoolId, debouncedQuery],
    queryFn: async (): Promise<GlobalSearchResult[]> => {
      try {
        checkPermission(currentRole, [
          "correspondent", "administrator", "principal", "viceprincipal", "accountant", "parent"
        ]);

        const { data } = await Api.get<GlobalSearchResponse>(
          `/api/global-search/search`,
          { params: { q: debouncedQuery, schoolId } }
        );

        if (data.ok) {
          return data.data;
        } else {
          throw new Error(data.message || 'Search failed');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        throw new Error(errorMessage);
      }
    },
    enabled: !!schoolId && isQueryValid,
    // staleTime: 30_000, // repeated searches for same term within 30s hit cache, not network
    placeholderData: (prev) => prev, // avoids flicker to empty while typing next char (v5 keepPreviousData)
  });

  return {
    entityResults: isQueryValid ? (result.data ?? []) : [],
    isSearching: isQueryValid && result.isFetching,
  };
};