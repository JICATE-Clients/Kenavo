'use client';

import { BugReporterProvider } from '@boobalan_jkkn/bug-reporter-sdk';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/auth/client';

/**
 * Validates if the Bug Reporter API URL is properly configured for the SDK
 * The SDK expects the BASE URL only (e.g., https://platform.com)
 * The SDK will append /api/v1/public/bug-reports automatically
 */
function isValidBugReporterPlatformUrl(url: string | undefined): boolean {
  if (!url) {
    console.warn('⚠️ Bug Reporter: No API URL configured');
    return false;
  }

  // SDK cannot work with localhost URLs (needs external platform)
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.warn('⚠️ Bug Reporter: Cannot use localhost URL for SDK');
    console.warn('   Current URL:', url);
    console.warn('   SDK requires external JKKN Bug Reporter Platform URL');
    console.warn('   Example: https://jkkn-centralized-bug-reporter.vercel.app');
    return false;
  }

  // Check for placeholder URLs
  if (url.includes('your-domain') || url.includes('example.com')) {
    console.warn('⚠️ Bug Reporter: Placeholder URL detected');
    return false;
  }

  // Must be a valid HTTP(S) URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.warn('⚠️ Bug Reporter: Invalid URL format');
    return false;
  }

  // Warn if URL includes /api/v1/public (SDK adds this automatically)
  if (url.includes('/api/v1/public')) {
    console.warn('⚠️ Bug Reporter: URL should be BASE URL only!');
    console.warn('   Current:', url);
    console.warn('   Should be:', url.split('/api/v1/public')[0]);
    console.warn('   SDK automatically appends /api/v1/public/bug-reports');
    return false;
  }

  return true;
}

export function BugReporterWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_BUG_REPORTER_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_BUG_REPORTER_API_URL;

  // Only enable SDK if we have a valid external platform URL
  const isValidPlatform = isValidBugReporterPlatformUrl(apiUrl);

  useEffect(() => {
    // Fetch user for context
    createClient().auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Log SDK status
    if (!isValidPlatform) {
      console.log('📋 Bug Reporter SDK: DISABLED');
      console.log('   Reason: No valid external platform URL configured');
      console.log('   To enable:');
      console.log('   1. Get JKKN Bug Reporter Platform URL');
      console.log('   2. Update .env.local:');
      console.log('      NEXT_PUBLIC_BUG_REPORTER_API_URL=https://your-platform.com/api/v1/public');
      console.log('   3. Restart dev server');
    } else {
      console.log('✅ Bug Reporter SDK: ENABLED');
      console.log('   Platform URL:', apiUrl);
    }
  }, [apiUrl, isValidPlatform]);

  // If platform is not valid, just render children without SDK
  if (!isValidPlatform || !apiKey) {
    return <>{children}</>;
  }

  // Valid platform - use SDK
  return (
    <BugReporterProvider
      apiKey={apiKey}
      apiUrl={apiUrl!}
      enabled={true}
      debug={process.env.NODE_ENV === 'development'}
      userContext={user ? {
        userId: user.id,
        name: user.user_metadata?.full_name,
        email: user.email
      } : undefined}
    >
      {children}
    </BugReporterProvider>
  );
}
