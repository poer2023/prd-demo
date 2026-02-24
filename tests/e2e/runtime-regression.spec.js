const { test, expect } = require("@playwright/test");

const RUNTIME_URL = "/workspace/c2me/commands?view=prototype&proto=runtime";

test.describe("runtime interaction regression", () => {
  test("can load runtime view and toggle theme", async ({ page }) => {
    await page.goto(RUNTIME_URL);

    const runtimeView = page.getByTestId("runtime-prototype-view");
    await expect(runtimeView).toBeVisible();

    const controls = page.getByTestId("runtime-controls");
    await expect(controls.getByText("Runtime Controls")).toBeVisible();

    const darkBtn = controls.getByRole("button", { name: "Dark" });
    await darkBtn.click();

    await expect(controls.getByRole("button", { name: "Dark" })).toHaveClass(/bg-blue-500/);
    await expect(page.getByTestId("runtime-spec-diff")).toContainText("int ~");
  });

  test("trace list is clickable and updates selection state", async ({ page }) => {
    await page.goto(RUNTIME_URL);

    const traces = page.getByTestId("runtime-traces");
    await expect(traces).toBeVisible();

    const firstTrace = traces.locator("button").first();
    await expect(firstTrace).toBeVisible();
    await firstTrace.click();
    await expect(firstTrace).toHaveClass(/bg-blue-50/);
  });
});
