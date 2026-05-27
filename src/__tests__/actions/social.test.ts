import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRedirect = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error("NEXT_REDIRECT")
  },
}))

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

function mockChain() {
  const chain: Record<string, vi.Mock> = {}
  const methods = ["insert", "delete", "update", "eq", "select", "order", "single", "maybeSingle", "in"]
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  return chain as Record<string, vi.Mock>
}

const mockQuery = mockChain()

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockQuery),
}

import { followUser, unfollowUser } from "@/lib/supabase/social"
import { createClient } from "@/lib/supabase/server"

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockResolvedValue(mockSupabase as never)
})

describe("followUser", () => {
  it("follows another user", async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "me" } },
    } as never)

    const formData = new FormData()
    formData.set("userId", "other-user")

    await followUser(formData)

    expect(mockSupabase.from).toHaveBeenCalledWith("friendships")
    expect(mockQuery.insert).toHaveBeenCalledWith({
      follower_id: "me",
      following_id: "other-user",
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith("/friends")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/feed")
  })

  it("does nothing when userId equals own id", async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "me" } },
    } as never)

    const formData = new FormData()
    formData.set("userId", "me")

    await followUser(formData)

    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it("redirects when not authenticated", async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: null },
    } as never)

    const formData = new FormData()

    await expect(followUser(formData)).rejects.toThrow("NEXT_REDIRECT")
    expect(mockRedirect).toHaveBeenCalledWith("/auth/sign-in")
  })
})

describe("unfollowUser", () => {
  it("unfollows a user", async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: { id: "me" } },
    } as never)

    const formData = new FormData()
    formData.set("userId", "other-user")

    await unfollowUser(formData)

    expect(mockSupabase.from).toHaveBeenCalledWith("friendships")
    expect(mockQuery.delete).toHaveBeenCalled()
    expect(mockQuery.eq).toHaveBeenCalledWith("follower_id", "me")
    expect(mockQuery.eq).toHaveBeenCalledWith("following_id", "other-user")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/friends")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/feed")
  })

  it("redirects when not authenticated", async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: null },
    } as never)

    const formData = new FormData()

    await expect(unfollowUser(formData)).rejects.toThrow("NEXT_REDIRECT")
    expect(mockRedirect).toHaveBeenCalledWith("/auth/sign-in")
  })
})
