const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const RUNTIME_URL = "/workspace/c2me/commands?view=prototype&proto=runtime";

test.describe("runtime visual baseline", () => {
  test("runtime canvas should match baseline", async ({ page }, testInfo) => {
    await page.goto(RUNTIME_URL);
    const canvas = page.getByTestId("runtime-canvas");
    await expect(canvas).toBeVisible();

    const snapshotPath = testInfo.snapshotPath("runtime-canvas.png");
    if (!fs.existsSync(snapshotPath)) {
      fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
      await canvas.screenshot({
        path: snapshotPath,
        animations: "disabled",
        caret: "hide",
      });
      testInfo.annotations.push({
        type: "baseline-seeded",
        description: "No visual baseline found. Seeded runtime-canvas.png.",
      });
      return;
    }

    await expect(canvas).toHaveScreenshot("runtime-canvas.png", {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.02,
    });
  });
});
