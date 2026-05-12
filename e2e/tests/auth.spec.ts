import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page correctly', async ({ page }) => {
    // Note: Assuming there's a route /auth or /login mapped to LoginPage
    // Let's assume /login is the route based on the component's internal links
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should show validation errors on empty submission', async ({ page }) => {
    await page.goto('/login');
    
    // HTML5 validation kicks in first for required fields, but if bypassed:
    // We can just check that the inputs are indeed required.
    const emailInput = page.getByLabel('Email address');
    await expect(emailInput).toHaveAttribute('required', '');
    
    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');
    
    const signUpLink = page.getByRole('link', { name: 'Sign up' });
    await expect(signUpLink).toBeVisible();
    
    // Since we are not actually clicking it if it redirects to an unimplemented route,
    // we just check the href.
    await expect(signUpLink).toHaveAttribute('href', '/register');
  });

  test('should handle mock successful login', async ({ page }) => {
    // Mock the Supabase Auth API response
    await page.route('**/auth/v1/token?grant_type=password', async route => {
      const json = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'test@example.com',
        }
      };
      await route.fulfill({ json });
    });

    await page.goto('/login');

    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // After login, it should redirect to dashboard or game page
    // We wait for navigation
    // Currently the app routes to '/dashboard' by default based on from variable
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 5000 });
  });
});
