import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { SubmitButton } from "@/components/submit-button"

const mockUseFormStatus = vi.fn()

vi.mock("react-dom", () => ({
  useFormStatus: (...args: unknown[]) => mockUseFormStatus(...args),
}))

describe("SubmitButton", () => {
  it("renders children text", () => {
    mockUseFormStatus.mockReturnValue({ pending: false })
    render(<SubmitButton>Save</SubmitButton>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("is not disabled when not pending", () => {
    mockUseFormStatus.mockReturnValue({ pending: false })
    render(<SubmitButton>Submit</SubmitButton>)
    expect(screen.getByRole("button")).not.toBeDisabled()
  })

  it("shows spinner and is disabled when pending", () => {
    mockUseFormStatus.mockReturnValue({ pending: true })
    render(<SubmitButton>Save</SubmitButton>)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button.querySelector("svg")).toBeInTheDocument()
  })

  it("applies danger variant styles", () => {
    mockUseFormStatus.mockReturnValue({ pending: false })
    render(<SubmitButton variant="danger">Delete</SubmitButton>)
    const button = screen.getByRole("button")
    expect(button.className).toContain("bg-red-600")
  })

  it("applies secondary variant styles", () => {
    mockUseFormStatus.mockReturnValue({ pending: false })
    render(<SubmitButton variant="secondary">Cancel</SubmitButton>)
    const button = screen.getByRole("button")
    expect(button.className).toContain("border-border")
  })
})
