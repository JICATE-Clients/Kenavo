'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import DirectoryHeroSection from '@/components/DirectoryHeroSection';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { ProfileCard as Profile } from '@/lib/api/profiles';
import { DirectorySearch } from '@/components/directory/DirectorySearch';
import { DirectoryFilters } from '@/components/directory/DirectoryFilters';
import { HorizontalFilters } from '@/components/directory/HorizontalFilters';
import { ActiveFilters } from '@/components/directory/ActiveFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { useProfileSearch } from '@/hooks/useProfileSearch';
import { useProfileFilters } from '@/hooks/useProfileFilters';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { FloatingAlphabetNav } from '@/components/directory/FloatingAlphabetNav';
import { createSlug } from '@/lib/utils/slug';

// Group alumni by first letter
const groupByLetter = (profiles: Profile[]) => {
  const groups: { [key: string]: Profile[] } = {};
  profiles.forEach(profile => {
    const firstLetter = profile.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(profile);
  });
  return groups;
};

// Add cache-busting parameter to force fresh image load
const getImageUrl = (url: string | null, profileId: number, updatedAt: string | null) => {
  if (!url) return '/placeholder-profile.svg';
  const separator = url.includes('?') ? '&' : '?';
  const cacheBuster = updatedAt ? new Date(updatedAt).getTime() : profileId;
  return `${url}${separator}t=${cacheBuster}`;
};

// AlphabetNavigation is defined outside component so React can memoize it properly
const AlphabetNavigation = ({ letters }: { letters: string[] }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 self-stretch mt-8 sm:mt-10 md:mt-12 lg:mt-[51px]">
      {alphabet.map((letter) => {
        const hasProfiles = letters.includes(letter);
        return (
          <div key={letter} className="inline-block">
            {hasProfiles ? (
              <a
                href={`#letter-${letter}`}
                className="text-[rgba(217,65,66,1)] hover:text-[rgba(217,65,66,0.8)] transition-colors text-base sm:text-lg md:text-xl lg:text-2xl font-normal inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-2"
              >
                {letter}
              </a>
            ) : (
              <span className="opacity-50 text-base sm:text-lg md:text-xl lg:text-2xl font-normal inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-2 text-[rgba(254,249,232,1)]">
                {letter}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ProfileCard is defined outside component so React can memoize it properly
const ProfileCard = ({ profile }: { profile: Profile }) => {
  const slug = createSlug(profile.name);
  const imageUrl = getImageUrl(profile.profile_image_url, profile.id, profile.updated_at);
  const isPlaceholder = !profile.profile_image_url;

  return (
    <article className="bg-[rgba(44,23,82,1)] flex grow flex-col font-normal w-full px-4 sm:px-5 py-5 sm:py-6 max-md:mt-6">
      <div className="aspect-[0.97] w-full self-stretch rounded-sm bg-[rgba(78,46,140,0.4)] overflow-hidden relative">
        {isPlaceholder ? (
          <Image
            src="/placeholder-profile.svg"
            width={200}
            height={200}
            className="w-full h-full object-cover"
            alt={`${profile.name} profile`}
          />
        ) : (
          <Image
            src={imageUrl}
            width={200}
            height={200}
            className="w-full h-full object-cover"
            alt={`${profile.name} profile`}
          />
        )}
      </div>
      <div className="text-[rgba(254,249,232,1)] text-base sm:text-lg md:text-xl lg:text-[24px] leading-[1.3] mt-4 sm:mt-5">
        {profile.name}
      </div>
      <Link
        href={`/directory/${slug}`}
        className="text-[rgba(217,81,100,1)] text-sm sm:text-base leading-none underline mt-5 sm:mt-6 md:mt-8 lg:mt-10 text-left hover:text-[rgba(217,81,100,0.8)] transition-colors inline-block"
      >
        View More
      </Link>
    </article>
  );
};

interface DirectoryPageContentProps {
  profiles: Profile[];
  fetchError?: string | null;
}

function DirectoryPageContent({ profiles: initialProfiles, fetchError }: DirectoryPageContentProps) {
  const searchParams = useSearchParams();

  const [profiles] = useState<Profile[]>(initialProfiles);
  const [error] = useState<string | null>(fetchError ?? null);

  // Search state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Mobile filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Check for refresh parameter in URL (kept for compatibility — full page nav will re-run server fetch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refreshParam = params.get('refresh');
      if (refreshParam) {
        // Remove refresh parameter from URL without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Apply filters first
  const filterHook = useProfileFilters(profiles);
  const filteredByFilters = filterHook.profiles;

  // Then apply search on filtered results
  const searchHook = useProfileSearch(filteredByFilters, debouncedSearchTerm);
  const finalProfiles = searchHook.profiles;

  // Sync URL with search/filter state
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.set('search', searchTerm);
    }

    if (filterHook.filters.cities.length > 0) {
      params.set('cities', filterHook.filters.cities.join(','));
    }

    if (filterHook.filters.countries.length > 0) {
      params.set('countries', filterHook.filters.countries.join(','));
    }

    if (filterHook.filters.industries.length > 0) {
      params.set('industries', filterHook.filters.industries.join(','));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, filterHook.filters]);

  const alumniByLetter = groupByLetter(finalProfiles);
  const letters = Object.keys(alumniByLetter).sort();

  const hasActiveSearchOrFilters = searchHook.isSearching || filterHook.hasActiveFilters;

  // Error state
  if (error) {
    return (
      <div className="bg-[rgba(64,34,120,1)] flex flex-col overflow-hidden items-stretch min-h-screen">
        <Header />
        <DirectoryHeroSection />
        <main className="w-full max-w-[1011px] mx-auto flex flex-col mt-12 md:mt-16 px-5 sm:px-8 md:px-10">
          <div className="text-[rgba(254,249,232,1)] text-center py-20">
            <p className="text-2xl text-red-400 mb-4">Error loading profiles</p>
            <p className="text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-[rgba(217,81,100,1)] text-white rounded hover:bg-[rgba(217,65,66,0.8)] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[rgba(64,34,120,1)] flex flex-col overflow-hidden items-stretch">
      <Header />
      <DirectoryHeroSection />

      {/* Floating A-Z Navigation for Mobile */}
      <FloatingAlphabetNav availableLetters={letters} />

      <main className="w-full max-w-[1200px] mx-auto flex flex-col mt-14 md:mt-20 px-5 sm:px-8 md:px-10">
        <p className="text-[rgba(254,249,232,1)] text-base sm:text-lg md:text-xl lg:text-[24px] font-normal leading-[1.6]">
          Start exploring you might just reconnect with someone you forgot you
          missed.
        </p>

        {/* Search and Filter Section */}
        <div className="mt-10 lg:mt-14">
          <div className="flex flex-col gap-4">
            {/* Full Width - Search and Horizontal Filters */}
            <div className="flex-1">
              {/* Search Bar */}
              <DirectorySearch
                value={searchTerm}
                onChange={setSearchTerm}
                resultCount={searchHook.resultCount}
                totalCount={profiles.length}
              />

              {/* Horizontal Filters (Desktop) */}
              <div className="hidden lg:block mt-4">
                <HorizontalFilters
                  cityOptions={filterHook.filterOptions.availableCities}
                  countryOptions={filterHook.filterOptions.availableCountries}
                  industryOptions={filterHook.filterOptions.availableIndustries}
                  selectedCities={filterHook.filters.cities}
                  selectedCountries={filterHook.filters.countries}
                  selectedIndustries={filterHook.filters.industries}
                  onToggleCity={filterHook.toggleCity}
                  onToggleCountry={filterHook.toggleCountry}
                  onToggleIndustry={filterHook.toggleIndustry}
                  onClearCities={() => {
                    filterHook.filters.cities.forEach((city) => filterHook.toggleCity(city));
                  }}
                  onClearCountries={() => {
                    filterHook.filters.countries.forEach((country) => filterHook.toggleCountry(country));
                  }}
                  onClearIndustries={() => {
                    filterHook.filters.industries.forEach((ind) => filterHook.toggleIndustry(ind));
                  }}
                  getCityCount={filterHook.getCityCount}
                  getCountryCount={filterHook.getCountryCount}
                  getIndustryCount={filterHook.getIndustryCount}
                />
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full bg-[rgba(44,23,82,1)] border-[rgba(78,46,140,0.6)] text-[rgba(254,249,232,1)] hover:bg-[rgba(78,46,140,0.4)] hover:text-[rgba(254,249,232,1)] transition-all duration-200 shadow-lg"
                >
                  <Filter className="h-4 w-4 mr-2 text-[rgba(217,81,100,1)]" />
                  Filters
                  {filterHook.activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-[rgba(217,81,100,1)] text-white text-xs rounded-full">
                      {filterHook.activeFilterCount}
                    </span>
                  )}
                </Button>

                {/* Mobile Filter Drawer */}
                {isFilterOpen && (
                  <div className="fixed inset-0 z-50 bg-[rgba(64,34,120,0.95)] backdrop-blur-md animate-in fade-in duration-200">
                    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[rgba(44,23,82,1)] shadow-2xl border-l border-[rgba(78,46,140,0.6)] animate-in slide-in-from-right duration-300">
                      <div className="flex items-center justify-between p-4 border-b border-[rgba(78,46,140,0.4)] bg-gradient-to-r from-[rgba(44,23,82,1)] to-[rgba(78,46,140,0.3)]">
                        <h2 className="text-lg font-semibold text-[rgba(254,249,232,1)]">Filters</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsFilterOpen(false)}
                          className="hover:bg-[rgba(78,46,140,0.4)] text-[rgba(217,81,100,1)] transition-all duration-200"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="overflow-auto h-[calc(100vh-5rem)]">
                        <DirectoryFilters
                          cityOptions={filterHook.filterOptions.availableCities}
                          countryOptions={filterHook.filterOptions.availableCountries}
                          industryOptions={filterHook.filterOptions.availableIndustries}
                          selectedCities={filterHook.filters.cities}
                          selectedCountries={filterHook.filters.countries}
                          selectedIndustries={filterHook.filters.industries}
                          onToggleCity={filterHook.toggleCity}
                          onToggleCountry={filterHook.toggleCountry}
                          onToggleIndustry={filterHook.toggleIndustry}
                          onClearAll={() => {
                            filterHook.clearAllFilters();
                            setIsFilterOpen(false);
                          }}
                          getCityCount={filterHook.getCityCount}
                          getCountryCount={filterHook.getCountryCount}
                          getIndustryCount={filterHook.getIndustryCount}
                          activeFilterCount={filterHook.activeFilterCount}
                          className="border-0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Filters */}
              {filterHook.hasActiveFilters && (
                <div className="mt-4">
                  <ActiveFilters
                    selectedCities={filterHook.filters.cities}
                    selectedCountries={filterHook.filters.countries}
                    selectedIndustries={filterHook.filters.industries}
                    onRemoveFilter={filterHook.removeFilter}
                    onClearAll={filterHook.clearAllFilters}
                  />
                </div>
              )}

              {/* Empty State */}
              {finalProfiles.length === 0 && hasActiveSearchOrFilters && (
                <div className="mt-12 text-center py-16 bg-[rgba(44,23,82,1)] rounded-lg border border-[rgba(78,46,140,0.6)] shadow-lg">
                  <div className="text-6xl mb-6 opacity-80">🔍</div>
                  <h3 className="text-2xl font-semibold text-[rgba(254,249,232,1)] mb-3">
                    No alumni found
                  </h3>
                  <p className="text-[rgba(254,249,232,0.7)] mb-8 text-lg">
                    {searchHook.isSearching
                      ? <>No results for &ldquo;<span className="text-[rgba(217,81,100,1)] font-medium">{searchTerm}</span>&rdquo;</>
                      : 'No alumni match the selected filters'}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      filterHook.clearAllFilters();
                    }}
                    className="bg-[rgba(217,81,100,1)] text-white hover:bg-[rgba(217,65,66,0.8)] border-0 transition-all duration-200 shadow-md"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alphabet Navigation */}
        {finalProfiles.length > 0 && <AlphabetNavigation letters={letters} />}

        {/* All sections A-Z */}
        {letters.map((letter, letterIndex) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className={`text-[rgba(217,81,100,1)] text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold leading-none ${letterIndex === 0 ? 'mt-14 sm:mt-18 md:mt-24 lg:mt-32 xl:mt-40' : 'mt-10 sm:mt-12 md:mt-16 lg:mt-20'}`}>
              {letter}
            </h2>

            {Array.from({ length: Math.ceil(alumniByLetter[letter].length / 3) }, (_, groupIndex) => (
              <div key={groupIndex} className="w-full max-w-[931px] mt-8 sm:mt-10 md:mt-12">
                <div className="gap-4 sm:gap-5 flex max-md:flex-col max-md:items-stretch">
                  {alumniByLetter[letter].slice(groupIndex * 3, (groupIndex + 1) * 3).map((profile) => (
                    <div key={profile.id} className="w-[33%] max-md:w-full max-md:ml-0">
                      <ProfileCard profile={profile} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}

interface DirectoryClientProps {
  profiles: Profile[];
  fetchError?: string | null;
}

export default function DirectoryClient({ profiles, fetchError }: DirectoryClientProps) {
  return (
    <Suspense fallback={
      <div className="bg-[rgba(64,34,120,1)] flex flex-col overflow-hidden items-stretch min-h-screen">
        <Header />
        <DirectoryHeroSection />
        <main className="w-full max-w-[1011px] mx-auto flex flex-col mt-12 md:mt-16 px-5 sm:px-8 md:px-10">
          <div className="text-[rgba(254,249,232,1)] text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgba(217,81,100,1)] mx-auto mb-4"></div>
            <p className="text-2xl">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <DirectoryPageContent profiles={profiles} fetchError={fetchError} />
    </Suspense>
  );
}
