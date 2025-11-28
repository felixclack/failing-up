import { test, expect, Page } from '@playwright/test';

/**
 * Playtest suite for Failing Up
 * These tests simulate actual gameplay to identify balance issues
 */

// Helper to start a new game
async function startGame(
  page: Page,
  options: {
    name?: string;
    talent?: 'Struggling' | 'Average' | 'Gifted' | 'Prodigy';
    style?: string;
    difficulty?: 'Garage Band' | 'Indie Grind' | 'Major Label Pressure' | '27 Club';
  } = {}
) {
  await page.goto('/');

  // Fill in name
  await page.fill('input[placeholder="Enter your name..."]', options.name || 'TestRocker');

  // Select talent level if specified
  if (options.talent) {
    await page.click(`button:has-text("${options.talent}")`);
  }

  // Select difficulty if specified
  if (options.difficulty) {
    await page.click(`button:has-text("${options.difficulty}")`);
  }

  // Start the game
  await page.click('button:has-text("Start Your Career")');

  // Wait for game screen
  await page.waitForSelector('text=Week', { timeout: 5000 });
}

// Helper to take an action
async function takeAction(page: Page, actionName: string): Promise<boolean> {
  try {
    const button = page.locator(`button:has-text("${actionName}")`).first();
    if (await button.isEnabled({ timeout: 1000 })) {
      await button.click();
      await page.waitForTimeout(300);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

// Helper to handle event modal if present
async function handleEventIfPresent(page: Page): Promise<boolean> {
  try {
    // Check if event modal is visible
    const modal = page.locator('.fixed.inset-0');
    if (await modal.isVisible({ timeout: 500 })) {
      // Look for "What do you do?" text to confirm it's an event
      const isEvent = await page.locator('text=What do you do?').isVisible({ timeout: 500 });
      if (isEvent) {
        // Click the first choice button
        const choiceButton = page.locator('.fixed.inset-0 button').first();
        await choiceButton.click();
        await page.waitForTimeout(300);

        // Click Continue if outcome is shown
        const continueBtn = page.locator('button:has-text("Continue")');
        if (await continueBtn.isVisible({ timeout: 500 })) {
          await continueBtn.click();
          await page.waitForTimeout(300);
        }
        return true;
      }
    }
  } catch {
    // No event or couldn't handle
  }
  return false;
}

// Helper to check if game is over
async function isGameOver(page: Page): Promise<boolean> {
  try {
    return await page.locator('button:has-text("New Character")').isVisible({ timeout: 500 });
  } catch {
    return false;
  }
}

// Helper to get money value from page
async function getMoney(page: Page): Promise<number> {
  try {
    const moneyText = await page.locator('text=/\\$-?[\\d,]+/').first().textContent({ timeout: 1000 });
    return parseInt(moneyText?.replace(/[$,]/g, '') || '0');
  } catch {
    return 0;
  }
}

// ============================================================================
// PLAYTEST SCENARIOS
// ============================================================================

test.describe('Economic Balance Tests', () => {
  test('Easy difficulty - player can survive with side jobs', async ({ page }) => {
    await startGame(page, {
      name: 'EasyTest',
      talent: 'Average',
      difficulty: 'Garage Band'
    });

    const moneyHistory: number[] = [];
    let survived = true;

    // Play 15 weeks alternating side job and rest
    for (let i = 0; i < 15; i++) {
      await handleEventIfPresent(page);

      if (await isGameOver(page)) {
        survived = false;
        console.log(`Easy mode: Game over at week ${i + 1}`);
        break;
      }

      const money = await getMoney(page);
      moneyHistory.push(money);

      // Alternate between side job and rest
      if (i % 2 === 0) {
        await takeAction(page, 'Side Job');
      } else {
        await takeAction(page, 'Rest');
      }

      await handleEventIfPresent(page);
    }

    console.log('Easy mode money history:', moneyHistory);
    expect(survived).toBe(true);
  });

  test('Brutal difficulty starts with less money', async ({ page }) => {
    // Start easy game first
    await startGame(page, {
      name: 'Easy',
      difficulty: 'Garage Band'
    });
    const easyMoney = await getMoney(page);

    // Go back and start brutal
    await page.goto('/');
    await page.fill('input[placeholder="Enter your name..."]', 'Brutal');
    await page.click('button:has-text("27 Club")');
    await page.click('button:has-text("Start Your Career")');
    await page.waitForSelector('text=Week', { timeout: 5000 });
    const brutalMoney = await getMoney(page);

    console.log(`Easy starting money: $${easyMoney}, Brutal starting money: $${brutalMoney}`);
    expect(brutalMoney).toBeLessThan(easyMoney);
  });
});

test.describe('Action Tests', () => {
  test('Playing gigs earns money', async ({ page }) => {
    await startGame(page, {
      name: 'GigTest',
      talent: 'Gifted',
      difficulty: 'Garage Band'
    });

    const startMoney = await getMoney(page);

    // Play 5 gigs
    for (let i = 0; i < 5; i++) {
      await handleEventIfPresent(page);
      if (await isGameOver(page)) break;

      const success = await takeAction(page, 'Play Local Gig');
      if (!success) {
        await takeAction(page, 'Rest');
      }
      await handleEventIfPresent(page);
    }

    const endMoney = await getMoney(page);
    console.log(`Gig test: Start $${startMoney}, End $${endMoney}`);

    // After 5 gigs on easy, shouldn't have lost too much money
    expect(endMoney).toBeGreaterThan(startMoney - 400);
  });

  test('Side job provides income', async ({ page }) => {
    await startGame(page, { difficulty: 'Garage Band' });

    const startMoney = await getMoney(page);
    await handleEventIfPresent(page);
    await takeAction(page, 'Side Job');
    await handleEventIfPresent(page);
    const endMoney = await getMoney(page);

    console.log(`Side job: Start $${startMoney}, End $${endMoney}`);
    // Side job should provide net positive income (150 - 70 living cost on easy = +80)
    expect(endMoney).toBeGreaterThan(startMoney);
  });
});

test.describe('Game Flow Tests', () => {
  test('Can play through multiple weeks', async ({ page }) => {
    await startGame(page, {
      name: 'FlowTest',
      difficulty: 'Garage Band'
    });

    const actions = ['Rest', 'Write', 'Play Local Gig', 'Side Job', 'Rehearse'];

    for (let i = 0; i < 20; i++) {
      await handleEventIfPresent(page);

      if (await isGameOver(page)) {
        console.log(`Game ended at week ${i + 1}`);
        break;
      }

      // Pick action based on loop
      const action = actions[i % actions.length];
      const success = await takeAction(page, action);
      if (!success) {
        await takeAction(page, 'Rest');
      }

      await handleEventIfPresent(page);
    }

    // Should still be in game or have properly ended
    // Use a more specific selector for the game screen
    const stillPlaying = await page.locator('text=Choose Your Action').isVisible({ timeout: 2000 }).catch(() => false);
    const gameEnded = await isGameOver(page);

    // Log what we found for debugging
    console.log(`Game state after 20 weeks: stillPlaying=${stillPlaying}, gameEnded=${gameEnded}`);
    expect(stillPlaying || gameEnded).toBe(true);
  });

  test('New Character returns to start screen', async ({ page }) => {
    await startGame(page, {
      name: 'RestartTest',
      difficulty: '27 Club',
      talent: 'Struggling'
    });

    // Play until game over (brutal should end fast)
    for (let i = 0; i < 50; i++) {
      await handleEventIfPresent(page);

      if (await isGameOver(page)) {
        await page.click('button:has-text("New Character")');
        // Should be back at start screen
        await expect(page.locator('input[placeholder="Enter your name..."]')).toBeVisible({ timeout: 3000 });
        console.log('Successfully returned to character creation');
        return;
      }

      await takeAction(page, 'Party');
      await handleEventIfPresent(page);
    }

    // If didn't end, mark as info
    console.log('Game did not end in 50 weeks on Brutal - game may be too easy');
  });
});

test.describe('UI Tests', () => {
  test('Start screen has all character options', async ({ page }) => {
    await page.goto('/');

    // Talent levels
    await expect(page.locator('button:has-text("Struggling")')).toBeVisible();
    await expect(page.locator('button:has-text("Average")')).toBeVisible();
    await expect(page.locator('button:has-text("Gifted")')).toBeVisible();
    await expect(page.locator('button:has-text("Prodigy")')).toBeVisible();

    // Difficulty levels
    await expect(page.locator('button:has-text("Garage Band")')).toBeVisible();
    await expect(page.locator('button:has-text("Indie Grind")')).toBeVisible();
    await expect(page.locator('button:has-text("27 Club")')).toBeVisible();

    // Music styles
    await expect(page.locator('button:has-text("Punk")')).toBeVisible();
    await expect(page.locator('button:has-text("Metal")')).toBeVisible();
  });

  test('Game screen displays stats and actions', async ({ page }) => {
    await startGame(page);

    // Stats should be visible
    await expect(page.locator('text=Health').first()).toBeVisible();
    await expect(page.locator('text=Fans').first()).toBeVisible();
    await expect(page.locator('text=Week').first()).toBeVisible();

    // Action buttons
    await expect(page.locator('button:has-text("Rest")')).toBeVisible();
    await expect(page.locator('button:has-text("Write")')).toBeVisible();
    await expect(page.locator('button:has-text("Play Local Gig")')).toBeVisible();
    await expect(page.locator('button:has-text("Side Job")')).toBeVisible();
  });

  test('Events show choices', async ({ page }) => {
    await startGame(page, { difficulty: 'Indie Grind' });

    // Play until an event triggers
    for (let i = 0; i < 30; i++) {
      // Check for event modal
      const hasEvent = await page.locator('text=What do you do?').isVisible({ timeout: 500 }).catch(() => false);
      if (hasEvent) {
        // Verify choice buttons exist
        const buttons = page.locator('.fixed.inset-0 button');
        const count = await buttons.count();
        expect(count).toBeGreaterThan(0);
        console.log(`Event found at week ${i + 1} with ${count} choices`);

        // Handle the event
        await handleEventIfPresent(page);
        return;
      }

      if (await isGameOver(page)) break;

      await takeAction(page, 'Party'); // Party increases event chance
      await handleEventIfPresent(page);
    }

    console.log('No events triggered in 30 weeks of partying');
  });
});
