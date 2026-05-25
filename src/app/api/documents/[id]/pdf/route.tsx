import { Font, renderToBuffer } from "@react-pdf/renderer"
import { join } from "path"
import { getDocument } from "@/actions/documents.actions"
import { DocumentPDFTemplate, getDocFilename } from "@/components/documents/DocumentPDFTemplate"

// Register Noto Sans Thai from the filesystem once per server process
let fontRegistered = false
function registerFont() {
  if (fontRegistered) return
  Font.register({
    family: "NotoSansThai",
    fonts: [
      { src: join(process.cwd(), "public/fonts/NotoSansThai-Regular.ttf") },
      { src: join(process.cwd(), "public/fonts/NotoSansThai-Bold.ttf"), fontWeight: "bold" },
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
        // RFC 5987 encoding supports Unicode filenames
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (err) {
    console.error("PDF generation error:", err)
    return new Response("Failed to generate PDF", { status: 500 })
  }
}
