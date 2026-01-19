import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/auth/register');

    // Fill in registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirm-password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome to AgentHub');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill in login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.bg-red-50')).toContainText('Invalid credentials');
  });
});

test.describe('Agent Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new agent', async ({ page }) => {
    await page.goto('/dashboard/agents/new');

    // Fill in agent form
    await page.fill('input[name="name"]', 'Test Agent');
    await page.fill('input[name="description"]', 'A test agent for E2E testing');
    await page.fill('textarea[name="systemPrompt"]', 'You are a helpful AI assistant.');
    await page.selectOption('div[data-radix-select-trigger]', 'openai');
    await page.selectOption('div[data-radix-select-trigger']', 'gpt-4');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to agent detail page
    await expect(page.locator('h1')).toContainText('Test Agent');
  });

  test('should display agent list', async ({ page }) => {
    await page.goto('/dashboard/agents');

    // Should display agents
    await expect(page.locator('.grid > div')).toHaveCount.greaterThanOrEqual(0);
  });

  test('should delete an agent', async ({ page }) => {
    await page.goto('/dashboard/agents');

    // Click delete button on first agent
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await deleteButton.click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());

    // Should show success message
    await expect(page.locator('.bg-green-50')).toContainText('Agent deleted');
  });
});

test.describe('Conversations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should start a conversation', async ({ page }) => {
    await page.goto('/dashboard/agents');

    // Click on an agent
    await page.click('.cursor-pointer');

    // Click "Start Conversation" button
    await page.click('button:has-text("Start Conversation")');

    // Should redirect to conversation page
    await expect(page).toHaveURL(/\/dashboard\/conversations/);
  });

  test('should send and receive messages', async ({ page }) => {
    await page.goto('/dashboard/agents');

    // Click on an agent
    await page.click('.cursor-pointer');

    // Click "Start Conversation" button
    await page.click('button:has-text("Start Conversation")');

    // Type a message
    await page.fill('input[placeholder="Type your message..."]', 'Hello, how are you?');

    // Send message
    await page.click('button[type="submit"]');

    // Should display user message
    await expect(page.locator('.bg-blue-600')).toContainText('Hello, how are you?');

    // Should display assistant response
    await expect(page.locator('.bg-gray-200')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/agents');

    // Should display mobile-friendly layout
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard/agents');

    // Should display tablet-friendly layout
    await expect(page.locator('nav')).toBeVisible();
  });
});
