import { test, expect } from '@playwright/test';

test.describe('AI Battle Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/battle/ai');
  });

  test('should show loading screen then trainer selection', async ({ page }) => {
    // Should eventually show trainer selection
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
  });

  test('should display all 8 trainers', async ({ page }) => {
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    const trainerCards = page.locator('.trainer-select-card');
    await expect(trainerCards).toHaveCount(8);
  });

  test('should allow selecting a trainer', async ({ page }) => {
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    
    // Click first trainer
    await page.locator('.trainer-select-card').first().click();
    
    // Button should now be enabled
    const continueBtn = page.locator('.energy-confirm-btn');
    await expect(continueBtn).toBeEnabled();
  });

  test('should navigate to energy selection after trainer pick', async ({ page }) => {
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    
    // Select trainer and continue
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    
    // Should show energy selection
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
  });

  test('should allow selecting exactly 4 energy types', async ({ page }) => {
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    
    // Select trainer and continue
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    
    // Select 4 energy types
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    
    // Start battle button should be enabled
    const startBtn = page.locator('text=START BATTLE');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toBeEnabled();
  });

  test('should start battle after energy selection', async ({ page }) => {
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    
    // Select trainer
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    
    // Select 4 energy types
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    
    // Start battle
    await page.locator('text=START BATTLE').click();
    
    // Should show battle arena
    await expect(page.locator('.battle-container')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=TURN 1')).toBeVisible();
    await expect(page.locator('text=END TURN')).toBeVisible();
  });

  test('should show VS display and action queue', async ({ page }) => {
    // Quick setup: trainer + energy
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    await page.locator('text=START BATTLE').click();
    
    // Verify battle UI elements
    await expect(page.locator('.vs-display')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.action-queue')).toBeVisible();
    await expect(page.locator('.energy-pool')).toBeVisible();
  });

  test('should show player and opponent Pokemon', async ({ page }) => {
    // Quick setup
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    await page.locator('text=START BATTLE').click();
    
    await expect(page.locator('.battle-container')).toBeVisible({ timeout: 5000 });
    
    // Should have player and enemy character cards (3 each = 6 total)
    const characterCards = page.locator('.character-card');
    await expect(characterCards).toHaveCount(6);
    
    // Player cards
    const playerCards = page.locator('.character-card.player');
    await expect(playerCards).toHaveCount(3);
    
    // Enemy cards  
    const enemyCards = page.locator('.character-card.enemy');
    await expect(enemyCards).toHaveCount(3);
  });

  test('should show surrender button and items button', async ({ page }) => {
    // Quick setup
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    await page.locator('text=START BATTLE').click();
    
    await expect(page.locator('.battle-container')).toBeVisible({ timeout: 5000 });
    
    // Surrender and Items buttons
    await expect(page.locator('text=SURRENDER')).toBeVisible();
    await expect(page.locator('.action-btn.item')).toBeVisible();
  });

  test('should show defeat screen on surrender', async ({ page }) => {
    // Quick setup
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    await page.locator('text=START BATTLE').click();
    
    await expect(page.locator('.battle-container')).toBeVisible({ timeout: 5000 });
    
    // Click surrender
    await page.locator('text=SURRENDER').click();
    
    // Should show defeat overlay 
    await expect(page.locator('text=DEFEAT')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=TRY AGAIN')).toBeVisible();
  });

  test('should display skill tooltips on hover', async ({ page }) => {
    // Quick setup
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    await page.locator('text=START BATTLE').click();
    
    await expect(page.locator('.battle-container')).toBeVisible({ timeout: 5000 });
    
    // Hover over first player skill
    const firstSkill = page.locator('.character-card.player .skill-slot').first();
    await firstSkill.hover();
    
    // Should show skill info panel
    await expect(page.locator('.skill-info-panel')).toBeVisible({ timeout: 3000 });
  });

  test('should open items panel', async ({ page }) => {
    // Quick setup
    await expect(page.locator('text=CHOOSE YOUR TRAINER')).toBeVisible({ timeout: 10000 });
    await page.locator('.trainer-select-card').first().click();
    await page.locator('.energy-confirm-btn').click();
    await expect(page.locator('text=SELECT YOUR ENERGY TYPES')).toBeVisible({ timeout: 5000 });
    const energyCards = page.locator('.energy-select-card');
    await energyCards.nth(0).click();
    await energyCards.nth(1).click();
    await energyCards.nth(2).click();
    await energyCards.nth(3).click();
    await page.locator('text=START BATTLE').click();
    
    await expect(page.locator('.battle-container')).toBeVisible({ timeout: 5000 });
    
    // Click items button
    await page.locator('.action-btn.item').click();
    
    // Items panel should be visible
    await expect(page.locator('.items-panel')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.items-panel-title')).toHaveText('ITEMS');
  });
});

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Pokemon|Arena|Naruto/i);
  });
});
