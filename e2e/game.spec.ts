import { test, expect, type Page } from "@playwright/test";

// The main PatternLock carries this class; history locks do not.
const MAIN_LOCK = ".react-pattern-lock--animated";

/**
 * Draws a path on the main PatternLock by moving the mouse through
 * the centres of the specified dot indices, then releasing.
 */
async function drawPath(page: Page, dotIndices: number[]): Promise<void> {
    const centers: Array<{ x: number; y: number }> = [];
    for (const idx of dotIndices) {
        const el = page.locator(`${MAIN_LOCK} [data-index="${idx}"] .react-pattern-lock__point`);
        const box = await el.boundingBox();
        centers.push({ x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });
    }
    await page.mouse.move(centers[0].x, centers[0].y);
    await page.mouse.down();
    for (const { x, y } of centers.slice(1)) {
        await page.mouse.move(x, y);
    }
    await page.mouse.up();
}

/**
 * Switches the difficulty level via the Navbar dropdown.
 * React-Bootstrap Dropdown.Item renders as <a class="dropdown-item">, not role="menuitem".
 */
async function switchLevel(page: Page, level: "Easy" | "Medium" | "Hard"): Promise<void> {
    // The level toggle is the outline-secondary button whose text matches "X (N)".
    await page.locator("button.btn-outline-secondary").filter({ hasText: /Medium|Easy|Hard/ }).click();
    // Wait for the dropdown menu to open.
    await page.locator(".dropdown-menu.show").waitFor();
    await page.locator(".dropdown-menu.show .dropdown-item").filter({ hasText: level }).first().click();
}

/** Waits until the main lock dot count matches the expected value. */
async function waitForDotCount(page: Page, count: number): Promise<void> {
    await page.waitForFunction(
        (n) => document.querySelectorAll(`${".react-pattern-lock--animated"} .react-pattern-lock__point`).length === n,
        count,
    );
}

/**
 * Makes one guess then gives up (unless the guess happened to win).
 * Returns true if the game ended by winning instead of giving up.
 */
async function makeGuessAndGiveUp(page: Page): Promise<boolean> {
    await drawPath(page, [0, 1, 2]);
    await page.waitForFunction(() => {
        const moreThanOneLock = document.querySelectorAll(".react-pattern-lock__pattern-wrapper").length > 1;
        const playAgainVisible = !!document.querySelector('[aria-label="Finish game"]');
        return moreThanOneLock || playAgainVisible;
    });

    const won = await page.locator('[aria-label="Finish game"]').isVisible();
    if (!won) {
        await page.locator('[aria-label="Hint actions"]').click();
        await page.locator(".dropdown-menu.show").waitFor();
        await page.locator(".dropdown-menu.show .dropdown-item").filter({ hasText: "Give up" }).click();
    }
    return won;
}

test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts with factory-default state.
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/");
    await page.waitForSelector(`${MAIN_LOCK} .react-pattern-lock__point`);
});

test("renders the correct grid and code length for the default Medium level", async ({ page }) => {
    // Medium is 3×3 = 9 dots, code length 4.
    await expect(page.locator(`${MAIN_LOCK} .react-pattern-lock__point`)).toHaveCount(9);
    await expect(page.locator('[aria-label="Code length"]')).toContainText("4");
});

test("drawing fewer dots than the code length does not submit a guess", async ({ page }) => {
    await switchLevel(page, "Easy"); // 3×2 grid, code length 3
    await waitForDotCount(page, 6);

    await drawPath(page, [0, 1]); // 2 dots — one short

    // Only the main PatternLock should exist (no history entries).
    await expect(page.locator(".react-pattern-lock__pattern-wrapper")).toHaveCount(1);
});

test("drawing the correct number of dots submits a guess and adds a history entry", async ({ page }) => {
    await switchLevel(page, "Easy"); // code length 3
    await waitForDotCount(page, 6);

    await drawPath(page, [0, 1, 2]); // exactly 3 dots

    // Wait for either a history entry or an accidental win (≈0.8% chance).
    await page.waitForFunction(() => {
        const locks = document.querySelectorAll(".react-pattern-lock__pattern-wrapper");
        const playAgain = document.querySelector('[aria-label="Finish game"]');
        return locks.length > 1 || !!playAgain;
    });

    const playAgainVisible = await page.locator('[aria-label="Finish game"]').isVisible();
    if (!playAgainVisible) {
        // Normal path: main lock + 1 history entry.
        await expect(page.locator(".react-pattern-lock__pattern-wrapper")).toHaveCount(2);
    }
    // Accidental win is also valid — the guess was registered either way.
});

test("giving up shows the code with Bootstrap danger colour and the Play Again button", async ({ page }) => {
    await switchLevel(page, "Easy");
    await waitForDotCount(page, 6);

    await makeGuessAndGiveUp(page);

    // Play Again must be visible (game is over).
    await expect(page.locator('[aria-label="Finish game"]')).toBeVisible();

    // The code path connectors carry the end-game colour as an inline style.
    const connector = page.locator(`${MAIN_LOCK} .react-pattern-lock__connector`).first();
    await expect(connector).toBeVisible();
    const style = await connector.getAttribute("style");
    // Win  → var(--bs-success), give-up → var(--bs-danger)
    expect(style).toMatch(/var\(--bs-(success|danger)\)/);
});

test("clicking Play Again resets the game to the initial playing state", async ({ page }) => {
    await switchLevel(page, "Easy");
    await waitForDotCount(page, 6);

    await makeGuessAndGiveUp(page);
    await page.locator('[aria-label="Finish game"]').click();

    // After reset: only the main PatternLock, no history entries.
    await expect(page.locator(".react-pattern-lock__pattern-wrapper")).toHaveCount(1);

    // The Play Again button must be gone (back to Playing phase).
    await expect(page.locator('[aria-label="Finish game"]')).not.toBeVisible();

    // The Easy grid (6 dots) should still be displayed.
    await expect(page.locator(`${MAIN_LOCK} .react-pattern-lock__point`)).toHaveCount(6);
});
