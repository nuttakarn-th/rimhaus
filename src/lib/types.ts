export type ReviewType = "short_video" | "photo" | "long_video"
export type JobStatus =
  | "lead" | "contacted" | "quoted"
  | "in_production" | "draft_sent" | "revision"
  | "approved" | "scheduled" | "posted"
  | "invoiced" | "paid" | "closed"
export type PaymentStatus = "pending" | "invoiced" | "received"
export type DealType = "paid_keep" | "paid_return" | "barter" | "gifted_self" | "gifted_brand"
export type ContentStatus = "idea" | "scripting" | "shooting" | "editing" | "ready" | "posted" | "cancelled"
export type ContentPillar = "room_corner" | "product_review" | "organization_tips" | "home_humor"
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
  scheduled_date: string | null
  deal_type: DealType
  payment_amount: number
  quote_amount: number | null
  payment_status: PaymentStatus
  status: JobStatus
  notes: string | null
  product_received: boolean
  product_value: number | null
  contact_channel: string | null
  contact_handle: string | null
  invoice_date: string | null
  created_at: string
  updated_at: string
}

export interface SocialToken {
  id: string
  user_id: string
  platform: "instagram" | "facebook"
  access_token: string
  token_type: string
  expires_at: string | null
  page_id: string | null
  page_name: string | null
  ig_user_id: string | null
  ig_username: string | null
  created_at: string
  updated_at: string
}

export interface SocialInsight {
  id: string
  user_id: string
  platform: "instagram" | "facebook"
  followers: number | null
  follows: number | null
  media_count: number | null
  avg_reach: number | null
  avg_impressions: number | null
  engagement_rate: number | null
  profile_views: number | null
  website_clicks: number | null
  audience_gender_age: Record<string, number> | null
  audience_city: Record<string, number> | null
  audience_country: Record<string, number> | null
  top_posts: Array<{ url: string; likes: number; comments: number; reach: number }> | null
  fetched_at: string
  created_at: string
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
  caption: string | null
  images: string[]
  hashtags: string | null
  status: ContentStatus
  content_pillar: ContentPillar | null
  is_sponsored: boolean
  link: string | null
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

export type RateCardCategory = "per_platform" | "bundle" | "addon" | "barter"

export interface RateCardPackage {
  id: string
  user_id: string
  name: string
  category: RateCardCategory
  price: number | null
  original_price: number | null
  unit: string | null
  description: string | null
  terms: string | null
  sub_items: Array<{ label: string; price: number }> | null
  platforms: string[]
  content_type: "video" | "photo" | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface RateCardSettings {
  id: string
  user_id: string
  page_name: string | null
  page_category: string | null
  image_url: string | null
  contact_line: string | null
  contact_email: string | null
  contact_phone: string | null
  notes: string[] | null
  social_stats: {
    ig_followers?: number | null
    ig_username?: string | null
    ig_avg_reach?: number | null
    ig_engagement_rate?: number | null
    updated_at?: string | null
    platforms?: Record<string, {
      followers?: number | null
      engagement_rate?: number | null
    }>
  } | null
  platform_logos: Record<string, string> | null
  platform_urls: Record<string, string> | null
  hero_heading: string | null
  hero_subtitle: string | null
  hero_bg_image_url: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  show_calculator: boolean
  stat_followers: string | null
  stat_engagement: string | null
  stat_reach: string | null
  stat_views: string | null
  copy_partners_label: string | null
  copy_ratecard_eyebrow: string | null
  copy_contact_heading: string | null
  copy_contact_subtitle: string | null
  updated_at: string
}

export interface IssuerProfile {
  id: string
  user_id: string
  name: string
  id_card: string | null
  address: string | null
  phone: string | null
  email: string | null
  contact_line: string | null
  bank_name: string | null
  bank_branch: string | null
  account_name: string | null
  account_number: string | null
  signature_url: string | null
  header_image_url: string | null
  is_default: boolean
  created_at: string
}

export type DocType = "quotation" | "invoice" | "receipt"
export type DocStatus = "draft" | "sent" | "paid" | "cancelled"

export interface Customer {
  id: string
  user_id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  contact_line: string | null
  address: string | null
  tax_id: string | null
  notes: string | null
  created_at: string
}

export type PitchCategory = 'cold_outreach' | 'follow_up' | 'barter' | 'collab' | 'general'

export interface PitchScript {
  id: string
  user_id: string
  name: string
  content: string
  category: PitchCategory
  customer_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DocumentItem {
  id: string
  document_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order: number
}

export interface Document {
  id: string
  user_id: string
  customer_id: string | null
  review_job_id: string | null
  doc_type: DocType
  doc_number: string
  doc_date: string
  due_date: string | null
  status: DocStatus
  customer_name: string | null
  customer_address: string | null
  customer_tax_id: string | null
  customer_contact: string | null
  subtotal: number
  discount_type: string
  discount_value: number
  discount_amount: number
  wht_rate: number
  wht_amount: number
  total: number
  notes: string | null
  doc_remarks: string | null
  payment_terms: string | null
  issuer_profile_id: string | null
  issuer_name: string | null
  issuer_id_card: string | null
  issuer_address: string | null
  issuer_phone: string | null
  issuer_email: string | null
  issuer_bank_name: string | null
  issuer_bank_branch: string | null
  issuer_account_name: string | null
  issuer_account_number: string | null
  issuer_signature_url: string | null
  issuer_header_image_url: string | null
  issuer_contact_line: string | null
  linked_quotation_id: string | null
  platforms: string[]
  created_at: string
  updated_at: string
  document_items?: DocumentItem[]
  customers?: { name: string } | null
  review_jobs?: { brand_name: string; product_name: string } | null
}

export interface PortfolioItem {
  id: string
  user_id: string
  type: "video" | "photo"
  title: string | null
  url: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface GalleryAlbum {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_image_url: string | null
  sort_order: number
  created_at: string
}

export interface GalleryItem {
  id: string
  user_id: string
  album_id: string | null
  image_url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export interface Partner {
  id: string
  user_id: string
  name: string | null
  logo_url: string
  sort_order: number
  is_visible: boolean
  created_at: string
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface AiProduct {
  id: string
  user_id: string
  name: string
  description: string | null
  image_url: string | null
  price: number | null
  affiliate_url: string
  affiliate_platform: string | null
  category: string
  room_types: string[]
  style_tags: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface AiGeneration {
  id: string
  session_id: string
  style: string
  room_type: string
  vibe: string | null
  generated_image_url: string | null
  products_shown: string[]
  created_at: string
}

export interface Article {
  id: string
  user_id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  category: string | null
  tags: string[]
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}
