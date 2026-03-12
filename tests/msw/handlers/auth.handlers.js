import { http, HttpResponse } from 'msw';

const allowedLifetimes = new Set(['31536000', '2592000', '86400', '3600']);

export const authHandlers = [
	http.post('https://api.potber.de/auth/login', async ({ request }) => {
		const { username, password, lifetime } = await request.json();
		if (!allowedLifetimes.has(String(lifetime))) {
			return new HttpResponse('Invalid lifetime', { status: 418 });
		}
		if (username === 'TestUser' && password === 'TestPassword') {
			// The 'correct' username and password during tests is "TestUser" and "TestPassword"
			return HttpResponse.json({ access_token: 'your-access-token' }, { status: 200 });
		} else if (username === 'LockedUser') {
			// The 'locked' username during tests is "LockedUser"
			return new HttpResponse('Forbidden', { status: 403 });
		} else {
			return new HttpResponse('Unauthorized', { status: 401 });
		}
	}),

	http.get('https://api.potber.de/auth/session', async ({ request }) => {
		const authorizationHeader = request.headers.get('Authorization');
		if (authorizationHeader === 'Bearer your-access-token') {
			return new HttpResponse(JSON.stringify({ username: 'TestUser', exp: 1234 }), { status: 200 });
		} else {
			return new HttpResponse('Unauthorized', { status: 401 });
		}
	})
];
