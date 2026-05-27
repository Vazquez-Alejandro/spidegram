export type GroupRole = "admin" | "member"

export type PhotoStatus = "pending" | "approved" | "rejected"

export type ReactionType = "like"

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
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

export interface GroupWithMemberCount extends Group {
  member_count: number
  role: GroupRole
}

export interface Album {
  id: string
  group_id: string
  name: string
  description: string | null
  cover_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  group_id: string
  album_id: string | null
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

export interface Friendship {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Reaction {
  id: string
  photo_id: string
  user_id: string
  type: ReactionType
  created_at: string
}

export type NotificationType =
  | "photo_uploaded"
  | "photo_approved"
  | "photo_rejected"
  | "new_comment"
  | "new_follower"

export interface Story {
  id: string
  user_id: string
  group_id: string
  media_url: string
  media_type: "photo" | "video"
  caption: string | null
  created_at: string
  expires_at: string
  viewed?: boolean
}

export interface StoryView {
  id: string
  story_id: string
  user_id: string
  viewed_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  actor_id: string
  group_id: string | null
  photo_id: string | null
  read: boolean
  created_at: string
}
