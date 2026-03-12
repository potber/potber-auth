import { expect, test } from '@playwright/test';
// import { testWithMsw } from '../_msw';

const validRoutePath =
	'/authorize?client_id=45a14ddc-e3d3-4b5b-a45a-a04946974adc&response_type=token&redirect_uri=https://potber.de/auth/callback';

test('should properly validate the form', async ({ page }) => {
	await page.goto(validRoutePath);
	const usernameField = page.getByLabel('Username');
	let isValid = await usernameField.evaluate((node: HTMLInputElement) => node.validity.valid);
	expect(isValid).toBe(false);
	await usernameField.fill('Foo');
	isValid = await usernameField.evaluate((node: HTMLInputElement) => node.validity.valid);
	expect(isValid).toBe(true);

	const passwordField = page.getByLabel('Passwort');
	isValid = await passwordField.evaluate((node: HTMLInputElement) => node.validity.valid);
	expect(isValid).toBe(false);
	await passwordField.fill('Bar');
	isValid = await passwordField.evaluate((node: HTMLInputElement) => node.validity.valid);
	expect(isValid).toBe(true);

	const lifetimeField = page.getByLabel('Sitzungsdauer');
	await lifetimeField.selectOption({ label: 'Ein Monat' });
	expect(await lifetimeField.inputValue()).toBe('2592000');
});

test('should fail to log in', async ({ page }) => {
	await page.goto(validRoutePath);
	await page.getByLabel('Username').fill('Foo');
	await page.getByLabel('Passwort').fill('Bar');
	await page.getByLabel('Sitzungsdauer').selectOption({ label: 'Ein Tag' });
	const responsePromise = page.waitForResponse((res) => {
		return res.url().includes('authorize?/login');
	});
	await page.getByText('Anmelden').click();
	const response = await responsePromise;
	const json = await response.json();
	const { type, status } = json;
	expect(type).toBe('failure');
	expect(status).toBe(401);
	await expect(page.getByText('Das hat leider nicht geklappt. Versuche es nochmal.')).toBeVisible();
});

test('should succeed to log in', async ({ page }) => {
	await page.goto(validRoutePath);
	await page.getByLabel('Username').fill('TestUser');
	await page.getByLabel('Passwort').fill('TestPassword');
	await page.getByLabel('Sitzungsdauer').selectOption({ label: 'Ein Tag' });
	const responsePromise = page.waitForResponse((res) => {
		return res.url().includes('authorize?/login');
	});
	await page.getByText('Anmelden').click();
	const response = await responsePromise;
	const json = await response.json();
	const { type, status } = json;
	expect(type).toBe('success');
	expect(status).toBe(200);
	await expect(page.getByText('Du wirst gleich weitergeleitet...')).toBeVisible();
});

test("should fail due to the user's account being locked", async ({ page }) => {
	await page.goto(validRoutePath);
	await page.getByLabel('Username').fill('LockedUser');
	await page.getByLabel('Passwort').fill('Bar');
	await page.getByLabel('Sitzungsdauer').selectOption({ label: 'Ein Tag' });
	const responsePromise = page.waitForResponse((res) => {
		return res.url().includes('authorize?/login');
	});
	await page.getByText('Anmelden').click();
	const response = await responsePromise;
	const json = await response.json();
	const { type, status } = json;
	expect(type).toBe('failure');
	expect(status).toBe(403);
	await expect(
		page.getByText(
			'Dein Account ist permanent gesperrt. Permanent gesperrte Accounts können sich bei potber-auth nicht anmelden.'
		)
	).toBeVisible();
});

test('should reject a tampered lifetime value before forwarding the login request', async ({
	page
}) => {
	await page.goto(validRoutePath);
	await page.getByLabel('Username').fill('TestUser');
	await page.getByLabel('Passwort').fill('TestPassword');
	await page.evaluate(() => {
		const select = document.querySelector('select[name="lifetime"]');
		if (!(select instanceof HTMLSelectElement)) throw new Error('Lifetime select not found');
		const option = document.createElement('option');
		option.value = '999999999';
		option.text = 'Tampered';
		select.append(option);
		select.value = option.value;
	});
	const responsePromise = page.waitForResponse((res) => {
		return res.url().includes('authorize?/login');
	});
	await page.getByText('Anmelden').click();
	const response = await responsePromise;
	const json = await response.json();
	const { type, status } = json;
	expect(type).toBe('failure');
	expect(status).toBe(400);
	await expect(page.getByText('Das hat leider nicht geklappt. Versuche es nochmal.')).toBeVisible();
});
