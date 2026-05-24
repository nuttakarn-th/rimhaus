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
  sub_items: Array<{ label: string; price: number }> | null
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
  bank_name: string | null
  bank_branch: string | null
  account_name: string | null
  account_number: string | null
  signature_url: string | null
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
  address: string | null
  tax_id: string | null
  notes: string | null
  created_at: string
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
  linked_quotation_id: string | null
  created_at: string
  updated_at: string
  document_items?: DocumentItem[]
  customers?: { name: string } | null
  review_jobs?: { brand_name: string; product_name: string } | null
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
