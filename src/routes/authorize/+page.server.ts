import { appConfig } from '$lib/config/app.config';
import { clients } from '$lib/config/clients.config';
import { isAllowedLifetime } from '$lib/config/login.config';
import { fetchApi } from '$lib/utils/server.utils.js';
import { createExpiryDate } from '$lib/utils/misc.utils.js';
import { isAllowedRedirectUri } from '$lib/utils/redirect-uri.utils.js';
import { getSession } from '$lib/utils/server.utils.js';
import { error, fail } from '@sveltejs/kit';
import { log } from '$lib/logging/index.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies, url, request }) => {
	const clientid = url.searchParams.get('client_id');
	const client = clients.find((client) => client.id === clientid);
	if (!clientid) error(400, 'Missing client_id. Did you forget to include it?');
	if (!client)
		error(
			400,
			"Invalid client_id. Did you forget to include your client into 'src/lib/config/clients.config.ts'?"
		);
	const responseType = url.searchParams.get('response_type');
	if (!responseType) error(400, 'Missing response_type. Did you forget to include it?');
	if (responseType !== 'token') error(400, "Invalid response_type. response_type must be 'token'.");
	const redirectUri = url.searchParams.get('redirect_uri');
	if (!redirectUri) error(400, 'Missing redirect_uri. Did you forget to include it?');
	const redirectUriMatch = client.allowedRedirectUris.find((uri) =>
		isAllowedRedirectUri(uri, redirectUri)
	);
	if (!redirectUriMatch)
		error(
			400,
			"Invalid redirect_uri. Did you forget to specify that URI in 'src/lib/config/clients.config.ts'?"
		);

	// In case the user is currently signed in, we need to validate the session
	const accessToken = cookies.get(appConfig.sessionCookieName);
	if (accessToken) {
		try {
			const session = await getSession(accessToken);
			if (!session) {
				// If the session is invalid, we terminate it
				cookies.delete(appConfig.sessionCookieName, { ...appConfig.sessionCookieOptions });
				return {};
			} else {
				// If the session is valid, there's no need for them to sign in again
				return { session: session, accessToken: accessToken };
			}
		} catch (err) {
			log(err instanceof Error ? err.message : String(err), {
				level: 'error',
				context: 'SessionLoad'
			});
			throw error(503, 'Authentication service unavailable.');
		}
	} else return {};
};

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');
		const lifetime = data.get('lifetime');

		if (
			typeof username !== 'string' ||
			typeof password !== 'string' ||
			typeof lifetime !== 'string'
		) {
			return fail(400);
		}

		if (!isAllowedLifetime(lifetime)) {
			log(`Rejected invalid lifetime value: ${lifetime}`, { level: 'warn', context: 'Login' });
			return fail(400);
		}

		try {
			const response = await fetchApi(appConfig.apiLoginEndpoint, {
				request: {
					method: 'POST',
					body: JSON.stringify({
						username,
						password,
						lifetime
					})
				}
			});
			if (!response.ok) {
				if (response.status === 403) return fail(403);
				else return fail(401);
			}
			const responseData = await response.json();
			const { access_token } = responseData;
			const session = await getSession(access_token);
			if (!session) throw new Error("The session couldn't be retrieved.");
			// Store the token in a cookie and return
			cookies.set(appConfig.sessionCookieName, access_token, {
				...appConfig.sessionCookieOptions,
				expires: createExpiryDate(session.exp)
			});
			return { accessToken: access_token };
		} catch (err) {
			log(err instanceof Error ? err.message : String(err), {
				level: 'error',
				context: 'Login'
			});
			return fail(503);
		}
	}
};
