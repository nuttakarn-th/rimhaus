import { Font, renderToBuffer } from "@react-pdf/renderer"
import { getDocument } from "@/actions/documents.actions"
import { DocumentPDFTemplate, getDocFilename } from "@/components/documents/DocumentPDFTemplate"
import { NOTO_SANS_THAI_REGULAR, NOTO_SANS_THAI_BOLD } from "@/lib/pdf-fonts"

// Fonts are embedded as base64 data URLs — works in all environments
// (Vercel serverless, local dev, Docker) without filesystem access
let fontRegistered = false
function registerFont() {
  if (fontRegistered) return
  Font.register({
    family: "NotoSansThai",
    fonts: [
      { src: NOTO_SANS_THAI_REGULAR },
      { src: NOTO_SANS_THAI_BOLD, fontWeight: "bold" },
    ],
  })
  fontRegistered = true
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const doc = await getDocument(id)
  if (!doc) {
    return new Response("Document not found", { status: 404 })
  }

  try {
    registerFont()
    const buffer = await renderToBuffer(<DocumentPDFTemplate doc={doc} />)
    const filename = getDocFilename(doc)

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (err) {
    console.error("PDF generation error:", err)
    return new Response("Failed to generate PDF", { status: 500 })
  }
}
