import { useMemo } from 'react';
import type { ProfileCard as Profile } from '@/lib/api/profiles';

export interface SearchOptions {
  searchFields?: ('name' | 'location' | 'current_job' | 'designation_organisation' | 'nicknames')[];
  caseSensitive?: boolean;
}

/**
 * Custom hook for searching profiles across multiple fields
 * Provides instant client-side search with <50ms response time
 *
 * @param profiles - Array of profiles to search
 * @param searchTerm - Search query string
 * @param options - Search configuration options
 * @returns Object containing filtered profiles and result count
 */
export function useProfileSearch(
  profiles: Profile[],
  searchTerm: string,
  options: SearchOptions = {}
) {
  const {
    searchFields = ['name', 'location', 'current_job', 'designation_organisation', 'nicknames'],
    caseSensitive = false,
  } = options;

  const { filteredProfiles, resultCount } = useMemo(() => {
    // If no search term, return all profiles
    if (!searchTerm || searchTerm.trim() === '') {
      return {
        filteredProfiles: profiles,
        resultCount: profiles.length,
      };
    }

    const term = caseSensitive ? searchTerm.trim() : searchTerm.trim().toLowerCase();

    // Filter profiles based on search term
    const filtered = profiles.filter((profile) => {
      // Check each enabled search field
      return searchFields.some((field) => {
        const fieldValue = profile[field];

        // Skip null/undefined fields
        if (!fieldValue) return false;

        const value = caseSensitive ? fieldValue : fieldValue.toLowerCase();
        return value.includes(term);
      });
    });

    return {
      filteredProfiles: filtered,
      resultCount: filtered.length,
    };
  }, [profiles, searchTerm, searchFields, caseSensitive]);

  return {
    profiles: filteredProfiles,
    resultCount,
    totalCount: profiles.length,
    hasResults: resultCount > 0,
    isSearching: searchTerm.trim().length > 0,
  };
}
