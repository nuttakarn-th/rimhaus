import Link from "next/link"
import Image from "next/image"
import { getPublicAlbumsWithItems } from "@/lib/public-data"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

type Album = Awaited<ReturnType<typeof getPublicAlbumsWithItems>>[number]

function AlbumCard({ album, featured = false }: { album: Album; featured?: boolean }) {
  const cover = album.items.find(i => i.image_url)
  return (
    <Link
      href={`/gallery/${album.id}`}
      className={`group relative block overflow-hidden bg-[hsl(35,20%,82%)] ${
        featured ? "aspect-[4/3] sm:aspect-[21/9]" : "aspect-[4/3]"
      }`}
    >
      {cover ? (
        <Image
          src={cover.image_url}
          alt={album.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes={featured ? "100vw" : "(max-width: 640px) 100vw, 50vw"}
          priority={featured}
        />
      ) : (
        <div className="w-full h-full bg-[hsl(35,20%,88%)]" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

      {/* Text overlay */}
      <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7">
        <p className="text-[10px] font-bold tracking-[0.38em] uppercase text-white/50 mb-1.5">
          {album.items.length} ภาพ
        </p>
        <h2
          className={`text-white leading-tight ${featured ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl"}`}
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
        >
          {album.name}
        </h2>
        {album.description && (
          <p className={`text-white/55 mt-1.5 line-clamp-1 ${featured ? "text-sm" : "text-xs"}`}>
            {album.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      </div>
    </Link>
  )
}

export default async function GalleryPage() {
  const albums = await getPublicAlbumsWithItems()
  const totalPhotos = albums.reduce((sum, a) => sum + a.items.length, 0)

  if (albums.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
        <h1
          className="text-5xl text-foreground"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
        >
          Gallery
        </h1>
        <p className="text-sm text-muted-foreground">ยังไม่มีรูปใน Gallery</p>
      </div>
    )
  }

  const [featured, ...rest] = albums

  return (
    <div className="pb-16">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="px-4 pt-10 pb-7 text-center">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60 mb-2">PORTFOLIO</p>
        <h1
          className="text-5xl sm:text-7xl text-foreground leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
        >
          Gallery
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          {albums.length} อัลบั้ม · {totalPhotos} ภาพ
        </p>
      </div>

      {/* ── Editorial statement ──────────────────────────── */}
      <ScrollReveal>
        <div className="py-10 sm:py-14 px-6 text-center">
          <p
            className="text-3xl sm:text-[2.5rem] leading-snug text-foreground/50 max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            A visual diary of a home in progress.
          </p>
        </div>
      </ScrollReveal>

      {/* ── Featured album (full-bleed hero) ────────────── */}
      <ScrollReveal>
        <AlbumCard album={featured} featured />
      </ScrollReveal>

      {/* ── Rest (2-col tight grid) ──────────────────────── */}
      {rest.length > 0 && (
        <div
          className={`grid gap-px bg-border mt-px ${
            rest.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {rest.map((album, i) => (
            <ScrollReveal key={album.id} delay={i * 80}>
              <AlbumCard album={album} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
