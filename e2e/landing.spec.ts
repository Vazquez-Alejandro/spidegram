import { test, expect } from "@playwright/test"

test("landing page renders", async ({ page }) => {
  await page.goto("/")

  await expect(page.locator("h1")).toContainText("Spidegram")
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible()
})

test("sign in page has form", async ({ page }) => {
  await page.goto("/auth/sign-in")

  await expect(page.locator("h1")).toContainText("Welcome back")
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.getByLabel("Password")).toBeVisible()
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()
})

test("sign up page has form", async ({ page }) => {
  await page.goto("/auth/sign-up")

  await expect(page.locator("h1")).toContainText("Create an account")
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.getByLabel("Password")).toBeVisible()
  await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible()
})
