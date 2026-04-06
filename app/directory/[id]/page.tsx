import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileHero from '@/components/ProfileHero';
import QuestionAnswer from '@/components/QuestionAnswer';
import { getProfileBySlug, getAllProfileSlugs } from '@/lib/api/profiles';
import { getUser } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Enable automatic revalidation every hour to ensure fresh data from database
// This ensures designation/organization and other profile updates appear on production
// Balances performance (static generation) with data freshness (hourly updates)
export const revalidate = 3600; // Revalidate every hour (3600 seconds)

// Generate static paths for ALL 134 profiles
export async function generateStaticParams() {
  try {
    const slugs = await getAllProfileSlugs();
    return slugs.map(({ slug }) => ({ id: slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Allow dynamic routes for any other profile IDs at runtime
export const dynamicParams = true;

export default async function DirectoryIndividualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;

  // Check authentication and directory access
  const { user } = await getUser();

  if (!user) {
    // Not authenticated - redirect to login with return URL
    redirect(`/login?redirect=/directory/${slug}`);
  }

  // Check if user has directory access
  const { data: appUser, error: userError } = await supabaseAdmin
    .from('app_users')
    .select('id, email, username, has_directory_access, status')
    .eq('id', user.id)
    .single();

  if (userError || !appUser) {
    // User not found in app_users table - redirect to login for registration
    redirect(`/login?redirect=/directory/${slug}`);
  }

  // Check if account is active
  if (appUser.status !== 'active') {
    redirect('/access-denied?reason=account_inactive');
  }

  // Check directory access permission
  if (!appUser.has_directory_access) {
    redirect('/access-denied?reason=directory_access_denied');
  }

  // Fetch profile data by slug
  let profile;
  try {
    profile = await getProfileBySlug(slug);
  } catch (error) {
    console.error('Error fetching profile:', error);
    notFound();
  }

  // If profile not found, show 404
  if (!profile) {
    notFound();
  }

  return (
    <div className="bg-[rgba(78,46,140,1)] flex flex-col overflow-hidden items-stretch min-h-screen">
      <Header />

      {/* Spacer - Responsive height with smooth transitions */}
      <div className="flex min-h-[70px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] xl:min-h-[80px] w-full" />

      <main className="w-full flex-grow">
        {/* Back to Directory link */}
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0 pt-4 sm:pt-6">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6 text-sm"
          >
            ← Back to Directory
          </Link>
        </div>

        {/* Profile Hero Section */}
        <div className="py-4 sm:py-6 md:py-8 lg:py-10 xl:py-8">
          <ProfileHero
            name={profile.name}
            profileImageUrl={profile.profile_image_url}
            yearGraduated={profile.year_graduated}
            designationOrganisation={profile.designation_organisation}
            currentJob={profile.current_job}
            location={profile.location}
            nicknames={profile.nicknames}
            updatedAt={profile.updated_at}
          />
        </div>

        {/* Q&A Section */}
        <section
          className="self-center flex w-full max-w-[1200px] flex-col px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-10 mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-16"
          aria-label="Questions and Answers"
        >
          {/* Section Title */}
          <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-10">
            <h2 className="text-[rgba(217,81,100,1)] text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[48px] font-bold leading-tight sm:leading-tight md:leading-tight lg:leading-[1.2] xl:leading-[1.2] mb-2 sm:mb-3 md:mb-4 text-balance">
              Get to Know Me Better
            </h2>
            <p className="text-[rgba(254,249,232,0.8)] text-sm sm:text-base md:text-lg lg:text-xl">
              Explore questions and answers about my journey
            </p>
          </div>

          {/* Q&A List */}
          {profile.qa_responses && profile.qa_responses.length > 0 ? (
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
              {profile.qa_responses.map((qa, index) => (
                <QuestionAnswer
                  key={qa.question_id}
                  question={qa.question_text}
                  answer={qa.answer || 'No answer provided'}
                  isExpanded={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 bg-[rgba(255,255,255,0.03)] backdrop-blur-sm rounded-lg border border-[rgba(217,81,100,0.1)]">
              <div className="max-w-md mx-auto px-4">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mx-auto mb-4 sm:mb-5 md:mb-6 text-[rgba(217,81,100,0.5)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[rgba(254,249,232,1)] text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-3">
                  No Q&A responses available yet
                </p>
                <p className="text-[rgba(254,249,232,0.7)] text-sm sm:text-base md:text-lg lg:text-xl">
                  Check back later for updates
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
