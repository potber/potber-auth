import { expect, test } from '@playwright/test';

test('healthz should report the upstream API as reachable', async ({ request }) => {
	const response = await request.get('http://127.0.0.1:4173/healthz');
	expect(response.status()).toBe(200);
	await expect(response.json()).resolves.toMatchObject({
		status: 'OK',
		checks: {
			api: {
				status: 'OK',
				endpoint: '/auth/session'
			}
		}
	});
});
