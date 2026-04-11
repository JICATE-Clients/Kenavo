import React from 'react';
import { addCacheBuster } from '@/lib/utils/image-cache-buster';

interface ProfileHeroProps {
  name: string;
  profileImageUrl: string | null;
  yearGraduated: string | null;
  designationOrganisation: string | null;
  currentJob: string | null;
  location: string | null;
  nicknames: string | null;
  updatedAt: string;
  email: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  slug: string;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  name,
  profileImageUrl,
  yearGraduated,
  designationOrganisation,
  currentJob,
  location,
  nicknames,
  updatedAt,
  email,
  phone,
  isAuthenticated,
  slug,
}) => {
  // Format name for display (split into two lines if long)
  const formatName = (fullName: string) => {
    const words = fullName.split(' ');
    if (words.length <= 2) return [fullName];

    const midPoint = Math.ceil(words.length / 2);
    return [
      words.slice(0, midPoint).join(' '),
      words.slice(midPoint).join(' ')
    ];
  };

  const nameLines = formatName(name);
  const imageUrl = addCacheBuster(profileImageUrl || '/placeholder-profile.svg', updatedAt);

  return (
    <section className="self-center flex w-full max-w-[1200px] flex-col px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0">
      {/* Name - Mobile optimized with better spacing and text balance */}
      <h1 className="text-[rgba(217,81,100,1)] text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[48px] font-bold leading-tight sm:leading-tight md:leading-tight lg:leading-[1.15] xl:leading-[1.2] max-w-full md:max-w-[520px] mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-10 text-balance">
        {nameLines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < nameLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h1>

      {/* Profile Content - Two Column Layout */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 md:gap-8 lg:gap-10 xl:gap-8">
          {/* Left Column - Profile Image */}
          <div className="w-full">
            <div className="relative w-full overflow-hidden rounded-lg shadow-xl bg-[rgba(44,23,82,0.3)]">
              <img
                src={imageUrl}
                alt={`${name} Profile`}
                className="aspect-[0.95] object-cover object-center w-full h-full"
                loading="eager"
              />
            </div>
          </div>

          {/* Right Column - Profile Information */}
          <div className="w-full flex flex-col justify-start space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-6">
            {/* Tenure at Montfort */}
            {yearGraduated && (
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-lg p-4 sm:p-5 md:p-6 lg:p-7 xl:p-5 border border-[rgba(217,81,100,0.2)]">
                <div className="text-[rgba(217,81,100,1)] text-xs sm:text-sm md:text-base lg:text-[17px] font-medium uppercase tracking-wide mb-2 sm:mb-2.5 md:mb-3">
                  Tenure at Montfort
                </div>
                <div className="text-white text-lg sm:text-xl md:text-2xl lg:text-[26px] xl:text-[24px] font-semibold leading-tight lg:leading-[1.2] xl:leading-[1.25]">
                  {yearGraduated}
                </div>
              </div>
            )}

            {/* Designation / Organisation */}
            {(currentJob || designationOrganisation) && (() => {
              // Determine designation and organization
              let designation = currentJob;
              let organisation = designationOrganisation;

              // If designationOrganisation contains "/", split it
              if (designationOrganisation?.includes('/')) {
                const parts = designationOrganisation.split('/').map(part => part.trim());
                // If no currentJob, use first part as designation
                if (!designation && parts.length >= 2) {
                  designation = parts[0];
                  organisation = parts.slice(1).join(' / ');
                } else if (parts.length >= 1) {
                  // currentJob exists, so use designation_organisation as org only
                  organisation = designationOrganisation;
                }
              }

              const hasDesignation = !!designation;
              const hasOrganisation = !!organisation;

              return (
                <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-lg p-4 sm:p-5 md:p-6 lg:p-7 xl:p-5 border border-[rgba(217,81,100,0.2)]">
                  <div className="text-[rgba(217,81,100,1)] text-xs sm:text-sm md:text-base lg:text-[17px] font-medium uppercase tracking-wide mb-2 sm:mb-2.5 md:mb-3">
                    DESIGNATION / ORGANISATION
                  </div>
                  {hasDesignation && hasOrganisation ? (
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="text-white text-lg sm:text-xl md:text-2xl lg:text-[26px] xl:text-[24px] font-semibold leading-tight lg:leading-[1.2] xl:leading-[1.25] break-words">
                        {designation}
                      </div>
                      <div className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-[22px] xl:text-[20px] font-medium leading-tight break-words">
                        {organisation}
                      </div>
                    </div>
                  ) : (
                    <div className="text-white text-lg sm:text-xl md:text-2xl lg:text-[26px] xl:text-[24px] font-semibold leading-tight lg:leading-[1.2] xl:leading-[1.25] break-words">
                      {designation || organisation}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Current Location — visible only to authenticated users */}
            {isAuthenticated && location && (
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-lg p-4 sm:p-5 md:p-6 lg:p-7 xl:p-5 border border-[rgba(217,81,100,0.2)]">
                <div className="text-[rgba(217,81,100,1)] text-xs sm:text-sm md:text-base lg:text-[17px] font-medium uppercase tracking-wide mb-2 sm:mb-2.5 md:mb-3">
                  Current Location
                </div>
                <address className="text-white text-lg sm:text-xl md:text-2xl lg:text-[26px] xl:text-[24px] font-semibold leading-relaxed lg:leading-[1.3] xl:leading-[1.3] not-italic break-words">
                  {location.split(',').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line.trim()}
                      {idx < location.split(',').length - 1 && <>,<br /></>}
                    </React.Fragment>
                  ))}
                </address>
              </div>
            )}

            {/* Contact — visible only to authenticated users
                TODO(learning-mode): fill in the Contact block. Render ONLY when
                  isAuthenticated && (email || phone)
                Suggested structure (match the existing card styling above — same
                bg/border/padding/label-color classes for visual consistency):
                  1. A label "CONTACT" in the red-accent color
                  2. A mailto: link for email (if present)
                  3. A tel: link for phone (if present)
                Copy and iconography are your call — they set the tone for how the
                directory surfaces contact info to logged-in alumni. */}

            {/* Anon CTA — visible only to unauthenticated visitors who are
                missing at least one gated field
                TODO(learning-mode): fill in the anon CTA. Render ONLY when
                  !isAuthenticated && (location || email || phone)
                Should include a Link to `/login?redirect=/directory/${slug}` so
                logging in returns the visitor to this profile. Copy and styling
                are your call — this is the main conversion moment for public
                visitors, so make it inviting without feeling like a paywall.
                Note: when you add the Link, re-add `import Link from 'next/link';`
                at the top of this file — it was removed to avoid an unused-import
                lint error while the block is empty. */}

            {/* Nicknames */}
            {nicknames && (
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-lg p-4 sm:p-5 md:p-6 lg:p-7 xl:p-5 border border-[rgba(217,81,100,0.2)]">
                <div className="text-[rgba(217,81,100,1)] text-xs sm:text-sm md:text-base lg:text-[17px] font-medium uppercase tracking-wide mb-2 sm:mb-2.5 md:mb-3">
                  Nicknames
                </div>
                <div className="text-white text-lg sm:text-xl md:text-2xl lg:text-[26px] xl:text-[24px] font-semibold leading-tight lg:leading-[1.2] xl:leading-[1.25] break-words">
                  {nicknames}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
