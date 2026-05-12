import { test, expect } from '@playwright/test';

test.describe('Pet Core Loop', () => {
  test('should allow user to select an egg, warm it, and hatch a pet', async ({ page }) => {
    // 1. Visit the root URL which redirects to /egg-select or /auth depending on auth state.
    // For this test, we assume the guest flow works and lands on /egg-select.
    await page.goto('/egg-select');

    // Verify we are on Egg Select page
    await expect(page.getByRole('heading', { name: 'Choose Your Egg' })).toBeVisible();

    // Select the first egg (assuming Sakura Egg is rendered)
    const eggButton = page.locator('button').filter({ hasText: 'Sakura Egg' }).first();
    await eggButton.click();

    // Confirm selection
    const confirmButton = page.getByRole('button', { name: 'Confirm Selection ✨' });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // 2. We should now be on the Hatch page
    await expect(page).toHaveURL(/.*\/hatch/);
    await expect(page.getByRole('heading', { name: 'Warm the Egg' })).toBeVisible();

    // Click the egg repeatedly to warm it up
    // The egg is a clickable motion.div, we'll click it 10 times to reach 100 warmth
    const eggToWarm = page.locator('.cursor-pointer').first();
    for (let i = 0; i < 10; i++) {
      await eggToWarm.click();
    }

    // Hatch button should appear
    const hatchButton = page.getByRole('button', { name: 'Hatch Pet! 🎉' });
    await expect(hatchButton).toBeVisible();
    await hatchButton.click();

    // The hatching process takes 2000ms, then navigates to /game
    await expect(page).toHaveURL(/.*\/game/, { timeout: 5000 });

    // 3. We are on the Game page
    // Verify Stage badge is rendered
    await expect(page.getByText('Stage', { exact: true })).toBeVisible();
    await expect(page.getByText('BABY')).toBeVisible();

    // 4. Test Game Actions
    // Assuming there are buttons in the BottomNav for Feed, Play, Rest
    const feedButton = page.locator('button:has-text("Feed")').first();
    if (await feedButton.isVisible()) {
        await feedButton.click();
    }
  });
});
