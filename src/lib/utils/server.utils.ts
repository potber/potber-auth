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
	options?: { request?: RequestInit; accessToken?: string; timeoutMs?: number }
) {
	const { request, accessToken, timeoutMs = appConfig.apiRequestTimeoutMs } = { ...options };
	const url = `${appConfig.apiUrl}${endpoint}`;
	const headers: Record<string, string> = {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	};
	if (options?.accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
	const requestId = createRequestId();
	const controller = new AbortController();
	const timeoutId = setTimeout(
		() => controller.abort(`Request timed out after ${timeoutMs}ms`),
		timeoutMs
	);
	log(`Outgoing request [${requestId}]: ${request?.method ?? 'GET'} ${url}`, { context: 'Fetch' });
	try {
		const response = await fetch(url, { headers, ...request, signal: controller.signal });
		log(`Incoming response [${requestId}]: ${response.status} ${response.statusText}`, {
			context: 'Fetch'
		});
		return response;
	} catch (error) {
		log(
			`Request failed [${requestId}]: ${error instanceof Error ? error.message : String(error)}`,
			{
				level: 'error',
				context: 'Fetch'
			}
		);
		throw error;
	} finally {
		clearTimeout(timeoutId);
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

export async function checkApiReadiness() {
	const response = await fetchApi(appConfig.apiHealthEndpoint, {
		timeoutMs: appConfig.apiHealthTimeoutMs
	});
	const ok =
		response.ok || response.status === 401 || response.status === 403 || response.status === 405;
	return {
		ok,
		status: response.status
	};
}
