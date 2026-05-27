import { describe, it, expect, vi } from "vitest"
import { redirect } from "next/navigation"
import { redirectWithFlash } from "@/lib/flash"

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

describe("redirectWithFlash", () => {
  it("adds flash params to path without existing query", () => {
    redirectWithFlash("/dashboard", "success", "Done!")
    expect(redirect).toHaveBeenCalledWith(
      "/dashboard?flash_type=success&flash_msg=Done!",
    )
  })

  it("adds flash params to path with existing query", () => {
    redirectWithFlash("/groups/123?tab=photos", "error", "Not found")
    expect(redirect).toHaveBeenCalledWith(
      "/groups/123?tab=photos&flash_type=error&flash_msg=Not%20found",
    )
  })

  it("encodes special characters in message", () => {
    redirectWithFlash("/dashboard", "success", "Photo approved! 👍")
    expect(redirect).toHaveBeenCalledWith(
      "/dashboard?flash_type=success&flash_msg=Photo%20approved!%20%F0%9F%91%8D",
    )
  })
})
