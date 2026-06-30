# Bug Boundary Integration Reference Guide

## Package Information

- **Package Name**: `@boobalan_jkkn/bug-reporter-sdk`
- **Latest Version**: 1.3.2
- **NPM Registry**: https://www.npmjs.com/package/@boobalan_jkkn/bug-reporter-sdk
- **Package Size**: ~25 KB gzipped
- **Formats**: CJS, ESM, TypeScript definitions included

## Installation Methods

### Method 1: NPM Registry (Recommended for Production)

```bash
npm install @boobalan_jkkn/bug-reporter-sdk
```

Or using yarn:

```bash
yarn add @boobalan_jkkn/bug-reporter-sdk
```

**Troubleshooting 404 Errors:**
If you encounter "npm error 404 Not Found":

```bash
npm cache clean --force
npm install @boobalan_jkkn/bug-reporter-sdk
```

Alternative with explicit registry:

```bash
npm install @boobalan_jkkn/bug-reporter-sdk --registry=https://registry.npmjs.org/
```

### Method 2: Local File Path (Development Only)

```bash
npm install file:../packages/bug-reporter-sdk
```

### Method 3: Built Package (Development)

```bash
# Build the SDK
cd packages/bug-reporter-sdk
npm run build

# Install in project
cd your-project-directory
npm install file:path/to/packages/bug-reporter-sdk
```

## Environment Requirements

- **Next.js**: 15+ with App Router
- **React**: 19+
- **TypeScript**: 5+ (recommended)
- **Node.js**: 18+

## Environment Variables

Create or update `.env.local`:

```env
# JKKN Bug Reporter Configuration
NEXT_PUBLIC_BUG_REPORTER_API_KEY=app_your_api_key_here
NEXT_PUBLIC_BUG_REPORTER_API_URL=https://your-platform.vercel.app
```

**Security Note**: Never commit API keys to version control. Ensure `.env.local` is in `.gitignore`.

## Core Integration Patterns

### Pattern 1: Basic Next.js App Router Integration

File: `app/layout.tsx`

```typescript
import { BugReporterProvider } from '@boobalan_jkkn/bug-reporter-sdk';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BugReporterProvider
          apiKey={process.env.NEXT_PUBLIC_BUG_REPORTER_API_KEY!}
          apiUrl={process.env.NEXT_PUBLIC_BUG_REPORTER_API_URL!}
          enabled={true}
          debug={process.env.NODE_ENV === 'development'}
          userContext={{
            userId: 'user-id-here',
            name: 'John Doe',
            email: 'user@jkkn.ac.in'
          }}
        >
          {children}
        </BugReporterProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

### Pattern 2: Supabase Authentication Integration

Create a client wrapper component:

File: `components/bug-reporter-wrapper.tsx`

```typescript
'use client';

import { BugReporterProvider } from '@boobalan_jkkn/bug-reporter-sdk';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function BugReporterWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BugReporterProvider
      apiKey={process.env.NEXT_PUBLIC_BUG_REPORTER_API_KEY!}
      apiUrl={process.env.NEXT_PUBLIC_BUG_REPORTER_API_URL!}
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
```

Then update `app/layout.tsx`:

```typescript
import { BugReporterWrapper } from '@/components/bug-reporter-wrapper';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BugReporterWrapper>
          {children}
        </BugReporterWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

### Pattern 3: Conditional Rendering (Production/Beta Only)

```typescript
<BugReporterProvider
  apiKey={process.env.NEXT_PUBLIC_BUG_REPORTER_API_KEY!}
  apiUrl={process.env.NEXT_PUBLIC_BUG_REPORTER_API_URL!}
  enabled={
    process.env.NODE_ENV === 'production' &&
    user?.role === 'beta-tester'
  }
  debug={false}
>
  {children}
</BugReporterProvider>
```

## Advanced Features

### Network Request Capture (v1.2.0)

The SDK can automatically capture `fetch()` and `XHR` requests made by your app and attach them to bug reports, giving you network context for each issue. This is enabled by default and configured via three optional `BugReporterProvider` props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `networkCapture` | `boolean` | `true` | Enable automatic capture of `fetch()`/XHR requests |
| `networkBufferSize` | `number` | `10` | Max network requests stored (circular buffer) |
| `networkExcludePatterns` | `RegExp[]` | `[]` | URL patterns to exclude from capture |

```typescript
<BugReporterProvider
  apiKey={process.env.NEXT_PUBLIC_BUG_REPORTER_API_KEY!}
  apiUrl={process.env.NEXT_PUBLIC_BUG_REPORTER_API_URL!}
  enabled={true}
  networkCapture={true}
  networkBufferSize={20}
  networkExcludePatterns={[/\/analytics/, /\/heartbeat/]}
>
  {children}
</BugReporterProvider>
```

**Security:** Sensitive headers (`Authorization`, `Cookie`, API keys) are automatically filtered out, and the SDK's own API calls are auto-excluded to prevent recursion. The buffer auto-clears after a successful submission, and the captured network request count is added to report metadata.

### File Attachments (v1.3.0)

Users can attach files to a bug report directly from the widget — no configuration required:

- Up to **5 files** per report, **10 MB** each.
- Supported types: Images (PNG/JPG/GIF/WebP), PDF, TXT, CSV, JSON.
- Image thumbnails/previews, drag & drop, and automatic size/type validation.
- Files are stored in secure Supabase Storage.

This feature is available automatically in the bug widget once the SDK is installed.

### My Bugs Panel

Allow users to view their submitted bug reports. `MyBugsPanel` takes no props and reads from the `BugReporterProvider` context:

```typescript
import { MyBugsPanel } from '@boobalan_jkkn/bug-reporter-sdk';

export default function ProfilePage() {
  return (
    <div>
      <h1>My Profile</h1>
      <MyBugsPanel />
    </div>
  );
}
```

As of v1.3.0 the panel includes:

- **Statistics dashboard**: Total / Open / In Progress / Resolved counts.
- **Status filtering**: All / Open / In Progress / Resolved / Closed.
- **Expandable cards** with full report details.
- **Attachment grid viewer** with image previews.
- **Status + category badges** on each report.
- **Smart relative dates** (e.g. "5m ago", "2h ago").
- **Clickable page URLs and attachment links**.

### Leaderboard Panel (v1.3.0)

Display a bug-reporting leaderboard for your application. `LeaderboardPanel` requires leaderboard to be enabled in your organization settings.

```typescript
import { LeaderboardPanel } from '@boobalan_jkkn/bug-reporter-sdk';

export default function CommunityPage() {
  return (
    <div>
      <h1>Top Bug Reporters</h1>
      <LeaderboardPanel
        applicationId="your-app-id"
        limit={10}
        defaultPeriod="all-time"
      />
    </div>
  );
}
```

Props:

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `applicationId` | `string` | Yes | - |
| `limit` | `number` | No | `10` |
| `defaultPeriod` | `'all-time' \| 'weekly' \| 'monthly'` | No | `'all-time'` |

Features: period toggles (All Time / Week / Month), prize display, a points system, medals for the top 3, user avatars/profiles, and rankings by bug count + points.

### Programmatic Bug Reporting

Report bugs and interact with the platform from your own code using the `apiClient` exposed by `useBugReporter()`. Because `useBugReporter()` is a hook, it must be called at the top level of a **function component** (not inside a class component method or other non-component context):

```typescript
import { useBugReporter } from '@boobalan_jkkn/bug-reporter-sdk';

function ErrorReportButton({ error }: { error: Error }) {
  const { apiClient } = useBugReporter();

  const handleReport = async () => {
    try {
      await apiClient?.createBugReport({
        title: 'Automatic Error Report',
        description: error.message,
        page_url: window.location.href,
        category: 'bug',
        console_logs: [],
        // Screenshot is mandatory and handled automatically
      });
    } catch (err) {
      console.error('Failed to report bug:', err);
    }
  };

  return <button onClick={handleReport}>Report Error</button>;
}
```

The `apiClient` (`BugReporterApiClient`) exposes five methods:

| Method | Description |
|--------|-------------|
| `createBugReport(payload)` | Submit a new bug report (`SubmitBugReportRequest`). |
| `getMyBugReports(options?)` | List the current user's reports. Options: `{ page?, limit?, status?, category?, search? }`. |
| `getBugReportById(id, includeMessages?)` | Fetch a single report, optionally with its message thread. |
| `sendMessage(bugReportId, messageText, attachments?)` | Add a message to a report; `attachments` is an optional `string[]`. |
| `getLeaderboard(applicationId, options?)` | Fetch leaderboard data. Options: `{ period?, limit? }`. |

`useBugReporter()` returns `{ apiClient, config, isEnabled }`, where `apiClient` is a `BugReporterApiClient | null` (null when the reporter is disabled). Valid categories are: `bug`, `feature`, `ui`, `performance`, `security`, `other` — use `bug` as a safe default.

### Custom Widget Styling

Override default styles in `globals.css` or component CSS:

```css
/* Custom floating button position */
.bug-reporter-widget {
  bottom: 2rem !important;
  right: 2rem !important;
}

/* Custom modal/widget styles */
.bug-reporter-sdk {
  font-family: 'Your Custom Font' !important;
}
```

## API Key Setup Process

1. **Sign up/Log in**: Visit the JKKN Bug Reporter platform login page
2. **Create Organization**: Create or join an organization (usually department name)
3. **Register Application**: Navigate to Applications → New Application
   - Name: Your application name
   - Slug: unique-app-slug
   - Description: Brief description
4. **Copy API Key**: Save the generated API key (format: `app_xxxxxxxxxx`)

## Features Included (through v1.3.x)

- **Floating Bug Report Button**: Bottom-right corner by default
- **MANDATORY Screenshot Capture**: Automatic screenshot on bug report (required)
- **AUTOMATIC Console Logs**: Captures console output automatically
- **Network Request Capture** (v1.2.0): Automatic `fetch()`/XHR capture with sensitive-header filtering
- **File Attachments** (v1.3.0): Up to 5 files (10 MB each), drag & drop, stored in Supabase Storage
- **Leaderboard Panel** (v1.3.0): Rankings by bug count + points, with prizes and medals
- **Enhanced My Bugs Panel** (v1.3.0): Statistics dashboard, status filtering, attachment viewer, relative dates
- **User Context Tracking**: Associates bugs with authenticated users
- **Browser & System Info**: Automatic device/browser metadata collection

## Common Issues & Solutions

### Issue: Widget Not Appearing

**Possible Causes:**
- `enabled` prop is `false`
- Invalid API key
- API URL unreachable
- JavaScript errors blocking initialization

**Solutions:**
1. Verify `enabled={true}` in BugReporterProvider
2. Check API key format (should start with `app_`)
3. Verify API URL is accessible
4. Check browser console for errors

### Issue: API Key Validation Failed

**Possible Causes:**
- Incorrect API key
- Inactive application
- Wrong API URL

**Solutions:**
1. Verify API key starts with "app_"
2. Check application is active in platform
3. Ensure API URL matches platform URL
4. Try regenerating the API key

### Issue: Screenshots Not Capturing (v1.1.0+)

**Possible Causes:**
- Browser blocking html2canvas library
- Content Security Policy (CSP) restrictions
- Conflicting screenshot libraries
- Modal/overlay interference

**Solutions:**
1. Check CSP headers allow html2canvas
2. Disable conflicting screenshot tools
3. Close overlays/modals before reporting
4. Check browser console for html2canvas errors

### Issue: Console Logs Empty (v1.1.0+)

**Possible Causes:**
- Using version older than v1.1.0
- No console activity before reporting
- BugReporterProvider not wrapping app correctly

**Solutions:**
1. Update to latest version: `npm install @boobalan_jkkn/bug-reporter-sdk@latest`
2. Verify version: `npm list @boobalan_jkkn/bug-reporter-sdk`
3. Ensure BugReporterProvider wraps entire app in layout
4. Perform actions that generate console output before reporting

### Issue: NPM 404 Error

**Possible Causes:**
- Package not yet in npm registry cache
- Network/registry connectivity issues

**Solutions:**
1. Clear npm cache: `npm cache clean --force`
2. Wait 5-10 minutes if package was recently published
3. Use explicit registry: `npm install @boobalan_jkkn/bug-reporter-sdk --registry=https://registry.npmjs.org/`
4. Verify package exists: https://www.npmjs.com/package/@boobalan_jkkn/bug-reporter-sdk

## Version Updates / Changelog

All releases from 1.0.x through 1.3.x are backward compatible — no code changes are required to adopt them.

### v1.3.0 (2026-01-02)
- **File Attachments**: up to 5 files (10 MB each) per report, stored in Supabase Storage.
- **`LeaderboardPanel`** component (new export).
- **Enhanced `MyBugsPanel`**: statistics dashboard, status filtering, attachment grid viewer, badges, smart relative dates.
- Bug status `'new'` renamed to `'open'` (statuses are now: open, in progress, resolved, closed).
- UI refinements (badges/dates). No breaking changes.

### v1.2.0 (2026-01-02)
- **Network Request Capture**: automatic `fetch()` + XHR capture.
- New props: `networkCapture`, `networkBufferSize`, `networkExcludePatterns`.
- Sensitive-header filtering and buffer auto-clear after submission. No breaking changes.

### v1.1.0 (2025-01-14)
- **Mandatory Screenshots**: widget requires screenshot capture before submission.
- **Automatic Console Log Capture**: all console output captured automatically.

### Upgrading from Previous Versions

```bash
npm install @boobalan_jkkn/bug-reporter-sdk@latest
```

No code changes required - new features activate automatically.
