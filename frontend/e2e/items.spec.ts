import { expect, test } from '@playwright/test';
import { randomEmail } from './helpers';

test('items page requires signing in', async ({ page }) => {
	await page.goto('/items');
	await expect(page.getByRole('heading', { name: 'Sign in required' })).toBeVisible();
});

test('signed-in user can add and list items', async ({ page }) => {
	await page.goto('/signup');
	await page.getByLabel('Name').fill('Item User');
	await page.getByLabel('Email').fill(randomEmail('items'));
	await page.getByLabel('Password').fill('password123');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page.getByText("You're signed in")).toBeVisible();

	await page.goto('/items');
	await expect(page.getByRole('heading', { name: 'Your items' })).toBeVisible();

	await page.getByPlaceholder(/Add an item/).fill('Groceries');
	await page.getByRole('button', { name: 'Add' }).click();
	await expect(page.getByText('Groceries')).toBeVisible();
});
