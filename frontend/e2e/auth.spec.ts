import { expect, test } from '@playwright/test';
import { randomEmail } from './helpers';

async function signUp(page, email: string) {
	await page.goto('/signup');
	await page.getByLabel('Name').fill('Playwright User');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('password123');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page.getByText("You're signed in")).toBeVisible();
}

test('sign up, sign out, and sign back in', async ({ page }) => {
	const email = randomEmail('auth');

	await signUp(page, email);

	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page.getByRole('heading', { name: 'Signed up!' })).toBeVisible();

	await page.goto('/signin');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill('password123');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByText("You're signed in")).toBeVisible();
});
