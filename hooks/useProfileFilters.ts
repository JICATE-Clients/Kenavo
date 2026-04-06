import { useMemo, useState, useCallback } from 'react';
import type { ProfileCard as Profile } from '@/lib/api/profiles';

export interface FilterState {
  cities: string[];
  countries: string[];
  industries: string[];
}

export interface FilterOptions {
  availableCities: string[];
  availableCountries: string[];
  availableIndustries: string[];
}

// Helper function to check if a string looks like a street address
function isStreetAddress(text: string): boolean {
  // Check for patterns like: "123", "123 Main St", "123/A", "A/123", house numbers, etc.
  const streetPatterns = [
    /^\d+$/,                           // Pure numbers like "110", "117"
    /^\d+\/\d+$/,                      // Format like "120/1", "13/68"
    /^\d+\/[A-Z]\d*$/i,                // Format like "18/F2", "5/C3"
    /^[A-Z]?\d+[A-Z]$/i,               // Format like "170A", "138H", "5C"
    /^\d+-\d+/,                        // Format like "2006-77", "138-21"
    /^\d+\s*[A-Z]\/\d+$/i,             // Format like "138 H/21"
    /^\d+\/\d+\s+\w+/,                 // Format like "198/1568 Vanavil nagar"
    /^\d+\s+\w+\s+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|way|court|ct|place|pl|circle|crescent|boulevard|blvd|real|nagar)/i,
    /\s+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|way|court|ct|place|pl|circle|crescent|boulevard|blvd|real|nagar)(\s|$)/i,
    /^\d+\s+[A-Z][a-z]+\s+[A-Z][a-z]+/,  // Format like "30 Braeburn Crescent", "2010 El Camino Real"
    /^[A-Z0-9]+\s+COL\s+/i,            // Format like "2803 COL MIRAMONTES"
    /^[A-Z]\d+\s+[A-Z]/i,              // Format like "5C Concert O Castle"
  ];

  return streetPatterns.some(pattern => pattern.test(text));
}

// Helper function to check if a string is a zip code
function isZipCode(text: string): boolean {
  // Check for patterns like: "636002", "641035", "682039" (Indian zip codes)
  // or "12345", "12345-6789" (US zip codes)
  return /^\d{5,6}(-\d{4})?$/.test(text);
}

// Helper function to check if string contains zip code pattern
function containsZipCode(text: string): boolean {
  return /\b\d{5,6}\b/.test(text);
}

// List of valid countries (only these 8 countries will be shown)
const VALID_COUNTRIES = new Set([
  'india',
  'australia',
  'canada',
  'united states',
  'honduras',
  'singapore',
  'thailand',
  'united arab emirates'
]);

// Country name variations and their normalized form
const COUNTRY_ALIASES: { [key: string]: string } = {
  // India variations
  'india': 'India',
  'ind': 'India',

  // Australia variations
  'australia': 'Australia',
  'aus': 'Australia',

  // Canada variations
  'canada': 'Canada',
  'can': 'Canada',

  // United States variations
  'united states': 'United States',
  'united states of america': 'United States',
  'usa': 'United States',
  'us': 'United States',
  'u.s.a': 'United States',
  'u.s.a.': 'United States',
  'u.s': 'United States',
  'u.s.': 'United States',
  'america': 'United States',
  'united states america': 'United States',

  // Honduras variations
  'honduras': 'Honduras',
  'hn': 'Honduras',

  // Singapore variations
  'singapore': 'Singapore',
  'sg': 'Singapore',
  'sgp': 'Singapore',

  // Thailand variations
  'thailand': 'Thailand',
  'thai': 'Thailand',
  'th': 'Thailand',

  // United Arab Emirates variations
  'united arab emirates': 'United Arab Emirates',
  'uae': 'United Arab Emirates',
  'u.a.e': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  'dubai': 'United Arab Emirates',
  'emirates': 'United Arab Emirates',
};

// List of known countries for checking (includes variations)
const KNOWN_COUNTRIES = new Set([
  // Valid countries and their variations
  'india', 'ind',
  'usa', 'united states', 'us', 'u.s.a', 'u.s.a.', 'u.s', 'u.s.', 'america', 'united states of america', 'united states america',
  'australia', 'aus',
  'canada', 'can',
  'singapore', 'sg', 'sgp',
  'uae', 'u.a.e', 'u.a.e.', 'united arab emirates', 'dubai', 'emirates',
  'thailand', 'thai', 'th',
  'honduras', 'hn',
  // Other countries (for filtering purposes)
  'uk', 'united kingdom', 'germany', 'france', 'italy', 'spain',
  'netherlands', 'switzerland', 'japan', 'china', 'south korea',
  'malaysia', 'indonesia', 'brazil', 'mexico', 'argentina', 'chile',
  'colombia', 'new zealand', 'ireland', 'sweden', 'norway', 'denmark',
  'finland', 'poland', 'portugal', 'austria', 'belgium', 'greece', 'turkey'
]);

// List of known Indian states (should not be treated as countries)
const INDIAN_STATES = new Set([
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
  'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
  'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
  'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
  'andaman and nicobar', 'chandigarh', 'dadra and nagar haveli', 'daman and diu',
  'delhi', 'jammu and kashmir', 'ladakh', 'lakshadweep', 'puducherry'
]);

// List of valid cities (based on your provided list)
const KNOWN_CITIES = new Set([
  // Indian Cities
  'bangalore', 'bengaluru', 'mumbai', 'delhi', 'chennai', 'hyderabad',
  'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kochi', 'cochin',
  'coimbatore', 'salem', 'trichy', 'tiruchirappalli', 'madurai', 'thanjavur',
  'erode', 'tirupur', 'vellore', 'tiruvannamalai', 'viluppuram', 'chengam',
  'rasipuram', 'tiruchengode', 'kumarapalayam', 'uthamapalayam', 'yercaud',
  'sholavandan', 'pattiveeranpatti', 'gudalur', 'guduvanchery',
  'edapally', 'sivathapuram',
  // North East India
  'shillong', 'dimapur', 'kohima', 'aizawl', 'siaha',
  // International - USA
  'mckinney', 'philadelphia', 'santa clara', 'new york', 'los angeles',
  'san francisco', 'chicago', 'houston', 'boston', 'seattle', 'austin',
  // International - Canada
  'toronto', 'windsor', 'vancouver', 'montreal', 'ottawa', 'calgary',
  'edmonton', 'stoney creek',
  // International - Australia
  'banksia grove', 'brisbane', 'sydney', 'melbourne', 'perth', 'adelaide',
  // International - Singapore
  'singapore', 'sengkang',
  // International - Thailand
  'nonthaburi', 'bangkok',
  // International - UAE
  'dubai', 'abu dhabi', 'sharjah',
  // International - Honduras
  'tegucigalpa',
  // Other International
  'london', 'manchester', 'birmingham', // UK
  'paris', 'lyon', // France
  'berlin', 'munich', // Germany
  'tokyo', 'osaka', // Japan
  'beijing', 'shanghai', // China
]);

// Neighborhoods/suburbs that should NOT be shown as cities
const NEIGHBORHOODS = new Set([
  'koramangala', 'whitefield', 'indiranagar', 'jayanagar', 'hsr layout', 'btm layout',
  'madhapur', 'gachibowli', 'hitech city',
  'panampilly nagar', 'panampilly',
  'iyappanthangal', 'kk nagar', 'k k nagar', 'egmore', 't nagar', 'adyar', 'velachery',
  'stanhope gardens', 'stanhope',
]);

// City to Country mapping (fallback when country not in location string)
const CITY_TO_COUNTRY: { [key: string]: string } = {
  // United States cities
  'mckinney': 'United States',
  'philadelphia': 'United States',
  'santa clara': 'United States',
  'new york': 'United States',
  'los angeles': 'United States',
  'san francisco': 'United States',
  'chicago': 'United States',
  'houston': 'United States',
  'boston': 'United States',
  'seattle': 'United States',
  'austin': 'United States',

  // Singapore (city-state, city name is country)
  'singapore': 'Singapore',
  'sengkang': 'Singapore',

  // Thailand cities
  'nonthaburi': 'Thailand',
  'bangkok': 'Thailand',

  // Honduras cities
  'tegucigalpa': 'Honduras',
};

// Helper function to extract city from location string
function extractCity(location: string | null): string | null {
  if (!location) return null;

  // Split by comma and clean up
  const parts = location.split(',').map(p => p.trim()).filter(p => p.length > 0);

  if (parts.length === 0) return null;

  // Look for a known city in the location parts
  for (const part of parts) {
    const lowerPart = part.toLowerCase();

    // Skip if it's a neighborhood
    if (NEIGHBORHOODS.has(lowerPart)) continue;

    // Skip if it's a street address
    if (isStreetAddress(part)) continue;

    // Skip if it's a zip code
    if (isZipCode(part)) continue;

    // Skip if it contains a zip code
    if (containsZipCode(part)) continue;

    // Skip if it's a known country
    if (KNOWN_COUNTRIES.has(lowerPart)) continue;

    // Skip if it's an Indian state
    if (INDIAN_STATES.has(lowerPart)) continue;

    // Check if it's a known city
    if (KNOWN_CITIES.has(lowerPart)) {
      // Return with proper capitalization
      return part.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
  }

  return null;
}

// Helper function to extract country from location string
function extractCountry(location: string | null): string | null {
  if (!location) return null;

  // Split by comma and clean up
  const parts = location.split(',').map(p => p.trim()).filter(p => p.length > 0);

  if (parts.length === 0) return null;

  // STRATEGY 1: Try to extract country directly from location string
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const lowerPart = part.toLowerCase().replace(/\./g, '').trim(); // Remove periods and trim

    // Skip if it's empty after cleaning
    if (!lowerPart) continue;

    // Skip if it's a street address
    if (isStreetAddress(part)) continue;

    // Skip if it's a zip code
    if (isZipCode(part)) continue;

    // Skip if it contains a zip code
    if (containsZipCode(part)) continue;

    // Skip Indian states (they're not countries)
    if (INDIAN_STATES.has(lowerPart)) continue;

    // Check if it's a known country variation and map to normalized name
    if (COUNTRY_ALIASES[lowerPart]) {
      const normalizedCountry = COUNTRY_ALIASES[lowerPart];
      // Only return if it's in our valid countries list
      if (VALID_COUNTRIES.has(normalizedCountry.toLowerCase())) {
        return normalizedCountry;
      }
    }

    // For short codes (2-3 chars), be more strict - must be at the end
    if (lowerPart.length <= 3 && i === parts.length - 1) {
      if (COUNTRY_ALIASES[lowerPart]) {
        const normalizedCountry = COUNTRY_ALIASES[lowerPart];
        if (VALID_COUNTRIES.has(normalizedCountry.toLowerCase())) {
          return normalizedCountry;
        }
      }
    }
  }

  // STRATEGY 2: Fallback - If no country found, try to infer from city
  const city = extractCity(location);
  if (city) {
    const lowerCity = city.toLowerCase();
    if (CITY_TO_COUNTRY[lowerCity]) {
      return CITY_TO_COUNTRY[lowerCity];
    }
  }

  return null;
}

// Helper function to map company/designation to industry domain
function extractIndustryDomain(designationOrganisation: string | null): string | null {
  if (!designationOrganisation) return null;

  const text = designationOrganisation.toLowerCase();

  // Technology & Software
  if (text.match(/\b(software|tech|IT|developer|engineer|programmer|data|cloud|cyber|digital|AI|machine learning|web|app|system|computer)\b/i)) {
    return 'Technology';
  }

  // Finance & Banking
  if (text.match(/\b(bank|finance|investment|trading|insurance|accounting|audit|wealth|capital|financial|fund|equity|credit)\b/i)) {
    return 'Finance & Banking';
  }

  // Healthcare & Medical
  if (text.match(/\b(health|medical|hospital|doctor|nurse|pharma|clinical|patient|care|therapy|medicine)\b/i)) {
    return 'Healthcare';
  }

  // Education
  if (text.match(/\b(education|school|university|college|teacher|professor|student|academic|learning|training)\b/i)) {
    return 'Education';
  }

  // Consulting
  if (text.match(/\b(consult|advisory|strategy|management|analyst)\b/i)) {
    return 'Consulting';
  }

  // Manufacturing & Engineering
  if (text.match(/\b(manufacturing|factory|production|industrial|mechanical|civil|chemical|automotive|aerospace)\b/i)) {
    return 'Manufacturing & Engineering';
  }

  // Sales & Marketing
  if (text.match(/\b(sales|marketing|business development|brand|advertising|promotion|customer success)\b/i)) {
    return 'Sales & Marketing';
  }

  // Media & Entertainment
  if (text.match(/\b(media|entertainment|film|music|art|design|creative|content|broadcasting|journalism)\b/i)) {
    return 'Media & Entertainment';
  }

  // Legal
  if (text.match(/\b(law|legal|attorney|lawyer|advocate|counsel|court)\b/i)) {
    return 'Legal';
  }

  // Government & Public Service
  if (text.match(/\b(government|public service|civil service|ministry|municipal|state|federal)\b/i)) {
    return 'Government & Public Service';
  }

  // Retail & E-commerce
  if (text.match(/\b(retail|ecommerce|e-commerce|shop|store|merchant)\b/i)) {
    return 'Retail & E-commerce';
  }

  // Real Estate & Construction
  if (text.match(/\b(real estate|property|construction|architect|builder|contractor)\b/i)) {
    return 'Real Estate & Construction';
  }

  // Hospitality & Tourism
  if (text.match(/\b(hotel|hospitality|tourism|travel|restaurant|food|beverage)\b/i)) {
    return 'Hospitality & Tourism';
  }

  // Non-profit & Social Services
  if (text.match(/\b(non-profit|nonprofit|NGO|charity|foundation|social|welfare|community)\b/i)) {
    return 'Non-profit & Social Services';
  }

  // Energy & Utilities
  if (text.match(/\b(energy|oil|gas|power|electric|utility|renewable|solar|wind)\b/i)) {
    return 'Energy & Utilities';
  }

  // Telecommunications
  if (text.match(/\b(telecom|telecommunications|network|mobile|wireless|broadband)\b/i)) {
    return 'Telecommunications';
  }

  // Transportation & Logistics
  if (text.match(/\b(transport|logistics|supply chain|shipping|delivery|fleet|freight)\b/i)) {
    return 'Transportation & Logistics';
  }

  // Agriculture
  if (text.match(/\b(agriculture|farming|agri|crop|livestock|food production)\b/i)) {
    return 'Agriculture';
  }

  // Default to Other if no match
  return 'Other';
}

/**
 * Custom hook for managing profile filters (city, country, industry)
 * Provides filter state management and filtered profile results
 *
 * @param profiles - Array of profiles to filter
 * @returns Filter state, filtered profiles, and control functions
 */
export function useProfileFilters(profiles: Profile[]) {
  const [filters, setFilters] = useState<FilterState>({
    cities: [],
    countries: [],
    industries: [],
  });

  // Extract unique filter options from profiles
  const filterOptions = useMemo<FilterOptions>(() => {
    const cities = new Set<string>();
    const countries = new Set<string>();
    const industries = new Set<string>();

    profiles.forEach((profile) => {
      // Extract cities
      const city = extractCity(profile.location);
      if (city) {
        cities.add(city);
      }

      // Extract countries
      const country = extractCountry(profile.location);
      if (country) {
        countries.add(country);
      }

      // Extract industry domains from designation_organisation
      const industryDomain = extractIndustryDomain(profile.designation_organisation);
      if (industryDomain) {
        industries.add(industryDomain);
      }
    });

    return {
      availableCities: Array.from(cities).sort(),
      availableCountries: Array.from(countries).sort(),
      availableIndustries: Array.from(industries).sort(),
    };
  }, [profiles]);

  // Apply filters to profiles
  const filteredProfiles = useMemo(() => {
    let result = profiles;

    // Filter by city
    if (filters.cities.length > 0) {
      result = result.filter((profile) => {
        const city = extractCity(profile.location);
        return city && filters.cities.includes(city);
      });
    }

    // Filter by country
    if (filters.countries.length > 0) {
      result = result.filter((profile) => {
        const country = extractCountry(profile.location);
        return country && filters.countries.includes(country);
      });
    }

    // Filter by industry domain
    if (filters.industries.length > 0) {
      result = result.filter((profile) => {
        const industryDomain = extractIndustryDomain(profile.designation_organisation);
        return industryDomain && filters.industries.includes(industryDomain);
      });
    }

    return result;
  }, [profiles, filters]);

  // Filter control functions
  const toggleCity = useCallback((city: string) => {
    setFilters((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }));
  }, []);

  const toggleCountry = useCallback((country: string) => {
    setFilters((prev) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter((c) => c !== country)
        : [...prev.countries, country],
    }));
  }, []);

  const toggleIndustry = useCallback((industry: string) => {
    setFilters((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      cities: [],
      countries: [],
      industries: [],
    });
  }, []);

  const removeFilter = useCallback((type: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((v) => v !== value),
    }));
  }, []);

  const hasActiveFilters = useMemo(
    () => filters.cities.length > 0 || filters.countries.length > 0 || filters.industries.length > 0,
    [filters]
  );

  const activeFilterCount = useMemo(
    () => filters.cities.length + filters.countries.length + filters.industries.length,
    [filters]
  );

  // Get counts for each filter option
  const getCityCount = useCallback(
    (city: string) => {
      return profiles.filter((p) => {
        const profileCity = extractCity(p.location);
        return profileCity === city;
      }).length;
    },
    [profiles]
  );

  const getCountryCount = useCallback(
    (country: string) => {
      return profiles.filter((p) => {
        const profileCountry = extractCountry(p.location);
        return profileCountry === country;
      }).length;
    },
    [profiles]
  );

  const getIndustryCount = useCallback(
    (industry: string) => {
      return profiles.filter((p) => {
        const industryDomain = extractIndustryDomain(p.designation_organisation);
        return industryDomain === industry;
      }).length;
    },
    [profiles]
  );

  return {
    // Filter state
    filters,
    filterOptions,
    hasActiveFilters,
    activeFilterCount,

    // Filtered results
    profiles: filteredProfiles,
    resultCount: filteredProfiles.length,
    totalCount: profiles.length,

    // Control functions
    toggleCity,
    toggleCountry,
    toggleIndustry,
    clearAllFilters,
    removeFilter,

    // Count functions
    getCityCount,
    getCountryCount,
    getIndustryCount,
  };
}
