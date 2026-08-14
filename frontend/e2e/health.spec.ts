import { expect, test } from '@playwright/test';

test('home page reports backend and database health', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ping backend' }).click();
	await expect(page.getByText('API: ok · DB: ok')).toBeVisible({ timeout: 10_000 });
});
