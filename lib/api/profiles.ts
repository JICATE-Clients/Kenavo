// API functions for fetching profile data from Supabase
import { supabase } from '../supabase'
import type { Profile, ProfileWithGallery, ProfileWithAnswers, ProfileQA } from '../types/database'
import { createSlug, slugMatchesName } from '../utils/slug'

/**
 * Fetch all profiles from the database
 * @returns Array of all alumni profiles
 */
export type ProfileCard = Pick<Profile, 'id' | 'name' | 'profile_image_url' | 'updated_at' | 'location' | 'current_job' | 'designation_organisation' | 'year_graduated' | 'nicknames'>

export async function getAllProfiles(): Promise<ProfileCard[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, profile_image_url, updated_at, location, current_job, designation_organisation, year_graduated, nicknames')
    .order('name')

  if (error) {
    console.error('Error fetching profiles:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch profiles by graduation year
 * @param year - Graduation year (e.g., "2000")
 * @returns Array of profiles from that year
 */
export async function getProfilesByYear(year: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('year_graduated', year)
    .order('name')

  if (error) {
    console.error('Error fetching profiles by year:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch a single profile by ID with gallery images
 * @param id - Profile ID
 * @returns Profile with associated gallery images
 */
export async function getProfileById(id: number): Promise<ProfileWithGallery | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      gallery_images (
        id,
        image_url,
        caption,
        image_type,
        order_index,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    throw error
  }

  return data as ProfileWithGallery
}

/**
 * Search profiles by name or location
 * @param searchTerm - Search query
 * @returns Array of matching profiles
 */
export async function searchProfiles(searchTerm: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
    .order('name')

  if (error) {
    console.error('Error searching profiles:', error)
    throw error
  }

  return data || []
}

/**
 * Get profiles count
 * @returns Total number of profiles in database
 */
export async function getProfilesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting profiles:', error)
    throw error
  }

  return count || 0
}

/**
 * Get unique graduation years
 * @returns Array of distinct graduation years
 */
export async function getGraduationYears(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('year_graduated')
    .not('year_graduated', 'is', null)
    .order('year_graduated')

  if (error) {
    console.error('Error fetching graduation years:', error)
    throw error
  }

  // Extract unique years
  const years = [...new Set(data?.map(item => item.year_graduated).filter(Boolean))]
  return years as string[]
}

/**
 * Fetch Q&A responses for a specific profile
 * @param profileId - Profile ID
 * @returns Array of Q&A pairs for this profile
 */
export async function getProfileQA(profileId: number): Promise<ProfileQA[]> {
  const { data, error } = await supabase
    .from('profile_answers')
    .select(`
      question_id,
      answer,
      profile_questions (
        question_text,
        order_index
      )
    `)
    .eq('profile_id', profileId)
    .order('profile_questions(order_index)')

  if (error) {
    // If table doesn't exist yet, return empty array (migrations not run)
    if (error.code === 'PGRST205') {
      console.warn('Profile Q&A tables not created yet. Run migrations first.')
      return []
    }
    console.error('Error fetching profile Q&A:', error)
    throw error
  }

  // Transform data to ProfileQA format
  const qaData = data?.map((item: any) => ({
    question_id: item.question_id,
    question_text: item.profile_questions?.question_text || '',
    answer: item.answer,
    order_index: item.profile_questions?.order_index || 0
  })) || []

  return qaData.sort((a, b) => a.order_index - b.order_index)
}

/**
 * Fetch profile by slug (URL-friendly version of name)
 * @param slug - URL slug (e.g., "david-a", "john-doe", "a-s-syed-ahamed-khan")
 * @returns Profile with Q&A responses, or null if not found
 *
 * IMPROVED: Handles special characters properly by using fuzzy matching
 * with slug comparison instead of exact name matching
 */
export async function getProfileBySlug(slug: string): Promise<ProfileWithAnswers | null> {
  // Strategy: Search by words in the slug to handle special characters
  // Example: "a-s-syed-ahamed-khan" searches for profiles containing these words
  // Then use slugMatchesName() to find the exact match

  const searchTerms = slug.split('-').filter(term => term.length > 0)
  if (searchTerms.length === 0) return null

  // Build OR query for partial matches
  // This finds all profiles that contain ANY of the search terms
  const orQuery = searchTerms.map(term => `name.ilike.%${term}%`).join(',')
  let { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .or(orQuery)

  if (profileError) {
    console.error('Error fetching profile by slug:', profileError)
    throw profileError
  }

  if (!profiles || profiles.length === 0) {
    // Fallback: ilike search can miss names with special characters (e.g., "R.Rangaraj")
    // because the slug strips characters the DB name retains, creating a mismatch.
    // Fall back to fetching all profiles and matching by slug comparison.
    const { data: allProfiles, error: fallbackError } = await supabase
      .from('profiles')
      .select('*')

    if (fallbackError || !allProfiles || allProfiles.length === 0) {
      return null
    }

    const fallbackMatch = allProfiles.filter(p => slugMatchesName(slug, p.name))
    if (fallbackMatch.length === 0) {
      console.warn(`No slug match found for: ${slug}`)
      return null
    }

    profiles = fallbackMatch
  }

  // Find exact match by comparing generated slugs
  // This handles special characters like periods, apostrophes, etc.
  const matchedProfiles = profiles.filter(p => slugMatchesName(slug, p.name))

  if (matchedProfiles.length === 0) {
    // No exact slug match found
    console.warn(`No exact slug match found for: ${slug}`)
    return null
  }

  // If multiple matches (duplicates), prefer:
  // 1. Profile with most recent updated_at
  // 2. Profile with more complete data (has company, job, etc.)
  let profile = matchedProfiles[0]

  if (matchedProfiles.length > 1) {
    console.warn(`Multiple profiles match slug "${slug}":`, matchedProfiles.map(p => `ID ${p.id}: ${p.name}`))

    // Prefer profile with most complete data
    profile = matchedProfiles.reduce((best, current) => {
      const bestScore = (best.designation_organisation ? 1 : 0) + (best.current_job ? 1 : 0) + (best.location ? 1 : 0)
      const currentScore = (current.designation_organisation ? 1 : 0) + (current.current_job ? 1 : 0) + (current.location ? 1 : 0)

      if (currentScore > bestScore) return current
      if (currentScore === bestScore) {
        // If equal data, prefer most recently updated
        return new Date(current.updated_at) > new Date(best.updated_at) ? current : best
      }
      return best
    })
  }

  // Fetch Q&A responses for this profile
  const qaResponses = await getProfileQA(profile.id)

  return {
    ...profile,
    qa_responses: qaResponses
  }
}

/**
 * Get all profile slugs (for static generation)
 * @returns Array of objects with slug for each profile
 */
export async function getAllProfileSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name')

  if (error) {
    console.error('Error fetching profile slugs:', error)
    throw error
  }

  return (data || []).map(profile => ({
    slug: createSlug(profile.name)
  }))
}
