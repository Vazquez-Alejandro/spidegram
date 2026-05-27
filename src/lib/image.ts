export function optimizeUrl(
  url: string | null | undefined,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string | null {
  if (!url) return null
  if (!url.includes("supabase.co/storage")) return url

  const params = new URLSearchParams()
  if (options.width) params.set("width", String(options.width))
  if (options.height) params.set("height", String(options.height))
  if (options.quality) params.set("quality", String(options.quality))
  if (options.format) params.set("format", options.format)

  const qs = params.toString()
  return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url
}
