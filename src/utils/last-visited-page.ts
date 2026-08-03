// ---------------------------------------------------------------------------
// Helpers for the "remember last visited page" feature.
// The last authenticated route is persisted to localStorage and restored after
// a logout → login round-trip (see hooks/useLastVisitedPage.ts).
// ---------------------------------------------------------------------------

/**
 * Guards a persisted path before it is used as a post-login redirect target.
 *
 * Accepts only router-relative in-app paths, rejecting:
 * - empty / null values
 * - protocol-relative URLs (`//evil.com`) and absolute URLs — open-redirect risk
 * - the auth routes themselves (would trap the user on the sign-in screen)
 */
export function isRestorablePath(path: string | null | undefined): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/auth')
  );
}
