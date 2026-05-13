import { Page } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific page
   */
  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with test credentials
   */
  async login(email: string = 'test@example.com', password: string = 'password123') {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');

    // Fill in login form
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    
    // Click login button
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await this.page.waitForURL('**/dashboard');
  }

  /**
   * Register a new user
   */
  async register(email: string = 'test@example.com', password: string = 'password123') {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');

    // Fill in registration form
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);
    await this.page.fill('input[name="username"]', 'testuser');
    
    // Click register button
    await this.page.click('button[type="submit"]');
    
    // Wait for registration to complete
    await this.page.waitForURL('**/login');
  }

  /**
   * Create a new pet
   */
  async createPet(name: string = 'Test Pet') {
    await this.page.goto('/pets/create');
    await this.page.waitForLoadState('networkidle');

    // Fill in pet creation form
    await this.page.fill('input[name="name"]', name);
    
    // Select personality
    await this.page.selectOption('select[name="personality"]', 'playful');
    
    // Click create button
    await this.page.click('button[type="submit"]');
    
    // Wait for pet creation to complete
    await this.page.waitForURL('**/pets');
  }

  /**
   * Perform pet action
   */
  async performPetAction(action: string) {
    await this.page.click(`button[data-action="${action}"]`);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }

  /**
   * Get current pet stats
   */
  async getPetStats() {
    const hunger = await this.page.textContent('[data-stat="hunger"]');
    const mood = await this.page.textContent('[data-stat="mood"]');
    const energy = await this.page.textContent('[data-stat="energy"]');
    const health = await this.page.textContent('[data-stat="health"]');

    return {
      hunger: parseInt(hunger),
      mood: parseInt(mood),
      energy: parseInt(energy),
      health: parseInt(health),
    };
  }

  /**
   * Wait for WebSocket connection
   */
  async waitForWebSocketConnection() {
    await this.page.waitForFunction(() => {
      const win = window as Window & { ws?: { readyState: number } };
      return win.ws?.readyState === 1; // WebSocket.OPEN
    }, { timeout: 5000 });
  }

  /**
   * Clear localStorage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }
}