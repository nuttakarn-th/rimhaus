import { unstable_cache } from "next/cache"
import { createPublicClient } from "@/lib/supabase/public"
import type { RateCardPackage, RateCardSettings, PortfolioItem, Partner, GalleryAlbum, GalleryItem } from "@/lib/types"

const db = () => createPublicClient()

export const getPublicSettings = unstable_cache(
  async (): Promise<RateCardSettings | null> => {
    const { data } = await db().from("rate_card_settings").select("*").limit(1).single()
    return data as RateCardSettings | null
  },
  ["public-settings"],
  { revalidate: 60, tags: ["public-settings"] }
)

export const getPublicPackages = unstable_cache(
  async (): Promise<RateCardPackage[]> => {
    const { data } = await db().from("rate_card_packages").select("*").eq("is_active", true).order("sort_order")
    return (data as RateCardPackage[]) ?? []
  },
  ["public-packages"],
  { revalidate: 60, tags: ["public-packages"] }
)

export const getPublicPortfolioItems = unstable_cache(
  async (): Promise<PortfolioItem[]> => {
    const { data } = await db().from("portfolio_items").select("*").eq("is_active", true).order("type").order("sort_order")
    return (data as PortfolioItem[]) ?? []
  },
  ["public-portfolio"],
  { revalidate: 60, tags: ["public-portfolio"] }
)

export const getPublicPartners = unstable_cache(
  async (): Promise<Partner[]> => {
    const { data } = await db().from("partners").select("*").order("sort_order")
    return (data as Partner[]) ?? []
  },
  ["public-partners"],
  { revalidate: 60, tags: ["public-partners"] }
)

export const getPublicAlbums = unstable_cache(
  async (): Promise<GalleryAlbum[]> => {
    const { data } = await db().from("gallery_albums").select("*").order("sort_order")
    return (data as GalleryAlbum[]) ?? []
  },
  ["public-albums"],
  { revalidate: 60, tags: ["public-gallery"] }
)

export const getPublicGalleryItems = unstable_cache(
  async (albumId?: string): Promise<GalleryItem[]> => {
    let q = db().from("gallery_items").select("*").order("sort_order")
    if (albumId) q = q.eq("album_id", albumId)
    const { data } = await q
    return (data as GalleryItem[]) ?? []
  },
  ["public-gallery-items"],
  { revalidate: 60, tags: ["public-gallery"] }
)

export const getPublicAlbumsWithItems = unstable_cache(
  async (): Promise<(GalleryAlbum & { items: GalleryItem[] })[]> => {
    const { data: albums } = await db().from("gallery_albums").select("*").order("sort_order")
    if (!albums?.length) return []
    const { data: items } = await db().from("gallery_items").select("*")
      .in("album_id", (albums as GalleryAlbum[]).map(a => a.id)).order("sort_order")
    return (albums as GalleryAlbum[]).map(album => ({
      ...album,
      items: ((items as GalleryItem[]) ?? []).filter(i => i.album_id === album.id),
    }))
  },
  ["public-albums-with-items"],
  { revalidate: 60, tags: ["public-gallery"] }
)
