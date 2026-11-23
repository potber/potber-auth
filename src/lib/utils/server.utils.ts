import { appConfig } from '$lib/config/app.config';
import { log } from '$lib/logging';
import { createRequestId } from './misc.utils';

/**
 * Triggers a `fetch` request to the API server.
 * @param endpoint The endpoint.
 * @param request (optional) The request object.
 * @returns The response.
 */
export async function fetchApi(
	endpoint: string,
	options?: { request?: RequestInit; accessToken?: string }
) {
	const { request, accessToken } = { ...options };
	const url = `${appConfig.apiUrl}${endpoint}`;
	const headers: Record<string, string> = {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	};
	if (options?.accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
	const requestId = createRequestId();
	const startedAt = Date.now();
	const fields = {
		method: request?.method ?? 'GET',
		path: new URL(url).pathname,
		request_id: requestId
	};
	log('Outgoing API request.', { context: 'Fetch', fields });

	try {
		const response = await fetch(url, { headers, ...request });
		log('API response received.', {
			context: 'Fetch',
			fields: {
				...fields,
				duration_ms: Date.now() - startedAt,
				status_code: response.status
			},
			level: response.status >= 500 ? 'error' : 'info'
		});
		return response;
	} catch (error) {
		log('API request failed.', {
			context: 'Fetch',
			error,
			fields: {
				...fields,
				duration_ms: Date.now() - startedAt
			},
			level: 'error'
		});
		throw error;
	}
}

/**
 * Uses the given `accessToken` to retrieve the corresponding session. Throws an exception
 * if the session is invalid.
 * @param accessToken The access token.
 * @returns The session object.
 */
export async function getSession(accessToken: string): Promise<App.Session | null> {
	const response = await fetchApi(appConfig.apiSessionEndpoint, {
		accessToken
	});
	if (response.ok) {
		const session: App.Session = await response.json();
		return session;
	} else {
		return null;
	}
}
