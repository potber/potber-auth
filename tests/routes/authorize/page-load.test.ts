import { expect, test } from '@playwright/test';

test('should fail when visiting /authorize without any parameters', async ({ page }) => {
	await page.goto('/authorize');
	await expect(page.getByText('Missing client_id')).toBeVisible();
});

test('should fail when visiting /authorize with an invalid client_id', async ({ page }) => {
	await page.goto('/authorize?client_id=invalid');
	await expect(page.getByText('Invalid client_id')).toBeVisible();
});

test('should fail when visiting /authorize without a response_type', async ({ page }) => {
	await page.goto('/authorize?client_id=45a14ddc-e3d3-4b5b-a45a-a04946974adc');
	await expect(page.getByText('Missing response_type')).toBeVisible();
});

test('should fail when visiting /authorize with an invalid response_type', async ({ page }) => {
	await page.goto(
		'/authorize?client_id=45a14ddc-e3d3-4b5b-a45a-a04946974adc&response_type=invalid'
	);
	await expect(page.getByText('Invalid response_type')).toBeVisible();
});

test('should fail when visiting /authorize with a missing redirect_uri', async ({ page }) => {
	await page.goto('/authorize?client_id=45a14ddc-e3d3-4b5b-a45a-a04946974adc&response_type=token');
	await expect(page.getByText('Missing redirect_uri')).toBeVisible();
});

test('should fail when visiting /authorize with an invalid redirect_uri', async ({ page }) => {
	await page.goto(
		'/authorize?client_id=45a14ddc-e3d3-4b5b-a45a-a04946974adc&response_type=token&redirect_uri=https://invalid-url.com/auth/callback'
	);
	await expect(page.getByText('Invalid redirect_uri')).toBeVisible();
});

test('should accept preview wildcard redirect_uri for the preview client', async ({ page }) => {
	await page.goto(
		'/authorize?client_id=1af5d165-2357-4bae-817d-a1d7f471ef67&response_type=token&redirect_uri=https://pr-123.potber.kristofdreier.de/auth/callback'
	);
	await expect(page.getByLabel('Username')).toBeVisible();
});

test('should reject nested preview subdomains for the preview client', async ({ page }) => {
	await page.goto(
		'/authorize?client_id=1af5d165-2357-4bae-817d-a1d7f471ef67&response_type=token&redirect_uri=https://foo.bar.potber.kristofdreier.de/auth/callback'
	);
	await expect(page.getByText('Invalid redirect_uri')).toBeVisible();
});

test('should show login form when request is valid', async ({ page }) => {
	await page.goto(
		'/authorize?client_id=45a14ddc-e3d3-4b5b-a45a-a04946974adc&response_type=token&redirect_uri=https://potber.de/auth/callback'
	);
	await expect(page.getByLabel('Username')).toBeVisible();
	await expect(page.getByLabel('Passwort')).toBeVisible();
	await expect(page.getByLabel('Sitzungsdauer')).toBeVisible();
	await expect(page.getByText('Anmelden')).toBeVisible();
});
