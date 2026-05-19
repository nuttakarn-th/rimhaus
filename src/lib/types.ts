export type ReviewType = "short_video" | "photo" | "long_video"
export type JobStatus = "accepted" | "in_progress" | "content_done" | "posted" | "closed"
export type PaymentStatus = "pending" | "invoiced" | "received"
export type DealType = "paid" | "barter_inbound" | "barter_outbound"
export type ContentStatus = "idea" | "scripting" | "shooting" | "editing" | "ready" | "posted" | "cancelled"
export type TransactionType = "income" | "expense"
export type PostStatus = "draft" | "scheduled" | "posted" | "archived"

export interface Platform {
  id: string
  label: string
  color: string
  icon_name: string
  is_active: boolean
  sort_order: number
}

export interface ReviewJob {
  id: string
  user_id: string
  brand_name: string
  product_name: string
  product_category: string | null
  review_type: ReviewType
  platforms: string[]
  deadline: string | null
  post_date: string | null
  deal_type: DealType
  payment_amount: number
  payment_status: PaymentStatus
  status: JobStatus
  notes: string | null
  product_received: boolean
  product_value: number | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  review_job_id: string | null
  type: TransactionType
  amount: number
  category: string | null
  description: string | null
  transaction_date: string
  payment_method: string | null
  slip_url: string | null
  created_at: string
  updated_at: string
  review_jobs?: { brand_name: string; product_name: string } | null
}

export interface ContentItem {
  id: string
  user_id: string
  review_job_id: string | null
  title: string
  description: string | null
  content_type: string
  platforms: string[]
  planned_date: string | null
  shoot_date: string | null
  idea_notes: string | null
  script: string | null
  hashtags: string | null
  status: ContentStatus
  is_sponsored: boolean
  created_at: string
  updated_at: string
}

export interface SocialPost {
  id: string
  user_id: string
  review_job_id: string | null
  content_item_id: string | null
  platform: string
  post_title: string
  post_url: string | null
  caption: string | null
  hashtags: string | null
  post_date: string | null
  status: PostStatus
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  reach: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
