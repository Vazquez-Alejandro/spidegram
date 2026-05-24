export type GroupRole = "admin" | "member"

export type PhotoStatus = "pending" | "approved" | "rejected"

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: GroupRole
  joined_at: string
}

export interface Photo {
  id: string
  group_id: string
  uploader_id: string
  url: string
  thumbnail_url: string | null
  caption: string | null
  is_public: boolean
  status: PhotoStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface PhotoComment {
  id: string
  photo_id: string
  user_id: string
  content: string
  created_at: string
}
