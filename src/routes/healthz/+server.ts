import { appConfig } from '$lib/config/app.config.js';
import { checkApiReadiness } from '$lib/utils/server.utils.js';
import { json } from '@sveltejs/kit';

/**
 * Used by
 * @type {import('./$types').RequestHandler}
 * */
export async function GET() {
	try {
		const readiness = await checkApiReadiness();
		if (!readiness.ok) {
			return json(
				{
					status: 'ERROR',
					checks: {
						api: {
							status: 'ERROR',
							code: readiness.status,
							endpoint: appConfig.apiHealthEndpoint
						}
					}
				},
				{ status: 503 }
			);
		}

		return json(
			{
				status: 'OK',
				checks: {
					api: {
						status: 'OK',
						code: readiness.status,
						endpoint: appConfig.apiHealthEndpoint
					}
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		return json(
			{
				status: 'ERROR',
				checks: {
					api: {
						status: 'ERROR',
						message: error instanceof Error ? error.message : String(error),
						endpoint: appConfig.apiHealthEndpoint
					}
				}
			},
			{ status: 503 }
		);
	}
}
