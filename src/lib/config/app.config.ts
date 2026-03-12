import { env } from '$env/dynamic/private';

function getTimeout(value: string | undefined, fallback: number) {
	const parsed = Number.parseInt(value ?? '', 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const appConfig = {
	apiUrl: env.VITE_API_URL ?? 'https://api.potber.de',
	apiLoginEndpoint: env.VITE_API_LOGIN_ENDPOINT ?? '/auth/login',
	apiSessionEndpoint: env.VITE_API_SESSION_ENDPOINT ?? '/auth/session',
	apiHealthEndpoint:
		env.VITE_API_HEALTH_ENDPOINT ?? env.VITE_API_SESSION_ENDPOINT ?? '/auth/session',
	apiRequestTimeoutMs: getTimeout(env.VITE_API_REQUEST_TIMEOUT_MS, 5000),
	apiHealthTimeoutMs: getTimeout(env.VITE_API_HEALTH_TIMEOUT_MS, 1500),
	sessionCookieName: `potber-auth-session`,
	sessionCookieOptions: {
		path: '/',
		sameSite: 'strict' as 'strict'
	}
};
