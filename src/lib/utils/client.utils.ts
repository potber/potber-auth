import { sleep } from './misc.utils';

/**
 * Parses the access token.
 * @param accessToken The access token.
 * @returns The session object.
 */
export function parseAccessToken(accessToken: string) {
	var base64Url = accessToken.split('.')[1];
	var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	var jsonPayload = decodeURIComponent(
		globalThis
			.atob(base64)
			.split('')
			.map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);
	return JSON.parse(jsonPayload);
}

/**
 * Returns the number of seconds until the session expires.
 */
export function getExpiresInSeconds(accessToken: string) {
	const { exp } = parseAccessToken(accessToken);
	const now = new Date().getTime();
	const expiresIn = Math.floor((exp * 1000 - now) / 1000);
	return expiresIn;
}

export function buildRedirectUrl(redirectUri: string, accessToken: string) {
	const url = new URL(redirectUri);
	url.hash = new URLSearchParams({
		access_token: accessToken,
		token_type: 'bearer',
		expires_in: String(getExpiresInSeconds(accessToken))
	}).toString();
	return url.toString();
}

/**
 * Redirects the user agent to the validated `redirect_uri` and hands over the `access_token`.
 * @param redirectUri The validated redirect URI.
 * @param accessToken The access token.
 * @param delay The delay after which the redirect will be performed.
 */
export async function redirect(redirectUri: string, accessToken: string, delay: number) {
	await sleep(delay);
	location.href = buildRedirectUrl(redirectUri, accessToken);
}
