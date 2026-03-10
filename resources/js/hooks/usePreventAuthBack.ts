import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

/**
 * Prevents the browser back/forward buttons from showing stale,
 * unauthorized, or cached pages after login/logout/role-switch.
 *
 * Call once in your main authenticated layout component.
 */
export function usePreventAuthBack(): void {
    const { auth } = usePage<PageProps>().props;
    const lastSessionId = useRef<string | null>(auth?.session_id ?? null);

    useEffect(() => {
        if (!auth?.user) return;

        const role = auth.user.role;
        const userId = auth.user.id;
        const sessionId = auth.session_id ?? null;
        const currentPath = window.location.pathname;

        // Role → dashboard path mapping
        const dashboardPaths: Record<string, string> = {
            admin: '/admin/dashboard',
            employer: '/employer/dashboard',
            job_seeker: '/job-seeker/jobs',
        };

        const correctDashboard = dashboardPaths[role] ?? '/';

        // Persist identity in sessionStorage for cross-tab detection
        sessionStorage.setItem('auth_user_id', String(userId));
        sessionStorage.setItem('auth_user_role', role);
        sessionStorage.setItem('auth_session_id', sessionId ?? '');
        // Flag used by inline Blade script to prevent bfcache flash
        sessionStorage.setItem('auth_logged_in', '1');
        sessionStorage.setItem('auth_dashboard', correctDashboard);

        // ── Helpers ──────────────────────────────────────────────────

        const guestPaths = [
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/auth/google',
        ];

        const isGuestPage = (path: string): boolean => {
            if (path === '/') return true;
            return guestPaths.some(
                (p) => path === p || path.startsWith(p + '/'),
            );
        };

        const rolePrefixes: Record<string, string> = {
            admin: '/admin',
            employer: '/employer',
            job_seeker: '/job-seeker',
        };

        const isWrongRole = (path: string): boolean => {
            for (const [r, prefix] of Object.entries(rolePrefixes)) {
                if (
                    r !== role &&
                    (path === prefix || path.startsWith(prefix + '/'))
                ) {
                    return true;
                }
            }
            return false;
        };

        const isStaleUser = (): boolean => {
            const stored = sessionStorage.getItem('auth_user_id');
            return !!stored && String(userId) !== stored;
        };

        const redirect = (dest: string): void => {
            // Hide page IMMEDIATELY to prevent any visual flash
            document.body.style.display = 'none';
            // Push an extra history entry so pressing Back again won't flash
            window.history.pushState(null, '', dest);
            window.location.replace(dest);
        };

        // ── Mount-time check ─────────────────────────────────────────

        if (
            isStaleUser() ||
            isGuestPage(currentPath) ||
            isWrongRole(currentPath)
        ) {
            redirect(correctDashboard);
            return;
        }

        // ── Event handlers ───────────────────────────────────────────

        const handlePopState = (): void => {
            const newPath = window.location.pathname;
            if (
                isStaleUser() ||
                isGuestPage(newPath) ||
                isWrongRole(newPath)
            ) {
                redirect(correctDashboard);
            }
        };

        const handlePageShow = (e: PageTransitionEvent): void => {
            if (e.persisted) {
                const newPath = window.location.pathname;
                if (
                    isStaleUser() ||
                    isGuestPage(newPath) ||
                    isWrongRole(newPath)
                ) {
                    redirect(correctDashboard);
                }
            }
        };

        const checkSession = (): void => {
            const liveSessionId =
                sessionStorage.getItem('auth_session_id');
            if (
                liveSessionId &&
                sessionId &&
                liveSessionId !== sessionId
            ) {
                window.location.replace('/login');
            }
        };

        const handleVisibility = (): void => {
            if (document.visibilityState === 'visible') checkSession();
        };

        const handleFocus = (): void => checkSession();

        // ── Register listeners ───────────────────────────────────────

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('pageshow', handlePageShow);
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('pageshow', handlePageShow);
            document.removeEventListener(
                'visibilitychange',
                handleVisibility,
            );
            window.removeEventListener('focus', handleFocus);
        };
    }, [auth]);

    // Keep session ref in sync
    useEffect(() => {
        if (auth?.session_id !== undefined) {
            lastSessionId.current = auth.session_id;
        }
    }, [auth?.session_id]);
}
