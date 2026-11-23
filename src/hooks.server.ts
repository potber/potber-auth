import { log } from '$lib/logging';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/healthz') return resolve(event);

	const startedAt = Date.now();
	const fields = {
		method: event.request.method,
		path: event.url.pathname
	};
	log('Incoming request.', { context: 'Request', fields });

	const response = await resolve(event);
	log('Request fulfilled.', {
		context: 'Response',
		fields: {
			...fields,
			duration_ms: Date.now() - startedAt,
			status_code: response.status
		},
		level: response.status >= 500 ? 'error' : 'info'
	});

	return response;
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	log('Unhandled request error.', {
		context: 'Response',
		error,
		fields: {
			method: event.request.method,
			path: event.url.pathname,
			status_code: status
		},
		level: 'error'
	});
};
