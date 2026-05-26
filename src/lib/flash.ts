import { redirect } from "next/navigation"

export function redirectWithFlash(
  path: string,
  type: "success" | "error",
  message: string,
) {
  const encoded = encodeURIComponent(message)
  const separator = path.includes("?") ? "&" : "?"
  redirect(`${path}${separator}flash_type=${type}&flash_msg=${encoded}`)
}
