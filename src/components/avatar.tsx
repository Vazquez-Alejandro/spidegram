interface AvatarProps {
  url?: string | null
  name?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-16 h-16 text-lg",
}

export function Avatar({ url, name, size = "md", className = "" }: AvatarProps) {
  const cls = `${sizeMap[size]} rounded-full shrink-0 ${className}`

  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={`${cls} object-cover ring-1 ring-white/10`}
      />
    )
  }

  const initial = name?.charAt(0)?.toUpperCase() || "?"

  return (
    <div
      className={`${cls} bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white`}
    >
      {initial}
    </div>
  )
}
