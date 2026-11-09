-- =============================================================================
-- Lock the profiles table: contact columns, inserts, updates
-- =============================================================================
-- NOT APPLIED. Apply only AFTER the code in this PR is merged AND deployed.
-- Order: 1) merge PR  2) wait for the deploy  3) apply this file  4) re-test as a stranger.
-- Applying it before the new code is live breaks /directory and every profile page
-- (the old code reads profiles with select('*') through the public anon key).
--
-- What it does
--   1. Strangers (anon role, the public key in the site's JavaScript) can no longer
--      read location, email, phone or linkedin_url. They keep the safe columns only.
--      Signed-in users (authenticated role) keep full read access, unchanged.
--   2. INSERT on profiles: admins only (app_users.role = 'admin' AND status = 'active').
--      Strangers can no longer insert. Normal signup never inserts a profiles row
--      (it only creates an auth user and an app_users row, via the service key), so
--      no own-row insert carve-out is needed.
--   3. UPDATE on profiles: a signed-in user may update only the row whose email
--      matches their login email. profiles has no user_id link column; email is the
--      only link to the auth account (bulk-create-auth-accounts makes accounts from
--      profiles.email). WITH CHECK stops a user moving their row to another email.
--
-- Not affected: every admin tool and the AI chat use the service-role key, which
-- bypasses RLS and keeps full table grants.
--
-- Before-copy of today's grants and policies:
--   ~/.config/obsidian/boxcmd/before-kenavo-profiles-grants-20261109.json
--   (anon and authenticated hold all table privileges; no column-level grants;
--    four policies, all restored exactly by the UNDO block below)
--
-- Note on Postgres: a column-level REVOKE does nothing while the role holds
-- table-level SELECT, so step 1 revokes table SELECT and grants back the safe
-- columns one by one. Any column added to profiles later is hidden from anon
-- until it is granted explicitly.
-- =============================================================================

BEGIN;

-- 1. Contact columns: anon keeps only the safe columns -------------------------
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id,
  name,
  profile_image_url,
  year_graduated,
  current_job,
  designation_organisation,
  bio,
  nicknames,
  created_at,
  updated_at
) ON public.profiles TO anon;

-- 2. INSERT: admins only --------------------------------------------------------
DROP POLICY IF EXISTS "Allow anon to insert profiles during import" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;

-- app_users has an own-row SELECT policy ("Users can read own record"), so this
-- check can see the caller's own role without a SECURITY DEFINER helper.
-- Admins listed only in the ADMIN_EMAILS env setting are not visible to SQL; they
-- still insert through the admin pages, which use the service-role key.
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.app_users au
      WHERE au.id = (SELECT auth.uid())
        AND au.role = 'admin'
        AND au.status = 'active'
    )
  );

-- 3. UPDATE: own row only -------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    email IS NOT NULL
    AND lower(email) = lower((SELECT auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    email IS NOT NULL
    AND lower(email) = lower((SELECT auth.jwt() ->> 'email'))
  );

COMMIT;

-- =============================================================================
-- UNDO (restores the grants and policies exactly as they were on 9 Nov 2026)
-- Run as one block:
-- =============================================================================
-- BEGIN;
--
-- -- 3. back to: any signed-in user can update any profile
-- DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
-- CREATE POLICY "Authenticated users can update profiles"
--   ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated
--   USING (true);
--
-- -- 2. back to: anyone (anon) and any signed-in user can insert
-- DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
-- CREATE POLICY "Allow anon to insert profiles during import"
--   ON public.profiles AS PERMISSIVE FOR INSERT TO anon
--   WITH CHECK (true);
-- CREATE POLICY "Authenticated users can insert profiles"
--   ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated
--   WITH CHECK (true);
--
-- -- 1. back to: anon reads every column (table-level SELECT, no column grants).
-- -- Column grants are separate from table grants, so remove them explicitly.
-- REVOKE SELECT (
--   id, name, profile_image_url, year_graduated, current_job,
--   designation_organisation, bio, nicknames, created_at, updated_at
-- ) ON public.profiles FROM anon;
-- GRANT SELECT ON public.profiles TO anon;
--
-- COMMIT;
--
-- Check after undo (should match the before-copy):
--   SELECT relacl FROM pg_class WHERE oid = 'public.profiles'::regclass;
--   SELECT policyname, roles, cmd, qual, with_check FROM pg_policies
--    WHERE schemaname = 'public' AND tablename = 'profiles' ORDER BY policyname;
-- =============================================================================
