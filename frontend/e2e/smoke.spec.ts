import { test, expect } from "@playwright/test"

test.describe("MediBook smoke flow", () => {
  test("landing page shows the hero and primary CTAs", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("link", { name: /check my symptoms/i })).toBeVisible()
  })

  test("can navigate from landing to the symptom checker", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /check my symptoms/i }).first().click()
    await expect(page).toHaveURL(/\/check-symptoms/)
    await expect(page.getByRole("heading", { name: /symptom checker/i })).toBeVisible()
    await expect(page.getByRole("textbox")).toBeVisible()
  })

  test("booking page lists the doctor search", async ({ page }) => {
    await page.goto("/book")
    await expect(page.getByRole("heading", { name: /book an appointment/i })).toBeVisible()
  })

  test("switching to Arabic flips the layout to RTL", async ({ page }) => {
    await page.goto("/")
    // The Arabic toggle button shows the glyph "ع"
    await page.getByRole("button", { name: "ع" }).click()
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
    await expect(page.locator("html")).toHaveAttribute("lang", "ar")
  })

  test("dark mode toggle adds the .dark class", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /toggle theme/i }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
  })
})
