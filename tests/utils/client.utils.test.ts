import { expect, test } from '@playwright/test';
import { buildRedirectUrl } from '../../src/lib/utils/client.utils';

const sampleAccessToken = [
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
	'eyJleHAiOjQxMDAwMDAwMDB9',
	'signature'
].join('.');

test('buildRedirectUrl uses the validated redirect URI and appends the token fragment', () => {
	const result = buildRedirectUrl('https://example.com/auth/callback?foo=bar', sampleAccessToken);
	const url = new URL(result);

	expect(url.origin + url.pathname + url.search).toBe('https://example.com/auth/callback?foo=bar');
	expect(url.hash).toContain('access_token=');
	expect(url.hash).toContain('token_type=bearer');
	expect(url.hash).toContain('expires_in=');
});
