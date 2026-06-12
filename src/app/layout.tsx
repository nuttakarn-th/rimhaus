import type { Metadata } from "next"
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-thai",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-inter",
})

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rimhaus — จัดการธุรกิจเพจแต่งบ้าน",
  description: "ระบบจัดการงานรีวิว การเงิน และคอนเทนต์สำหรับเพจแต่งบ้าน",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full ${ibmPlexSansThai.variable} ${inter.variable}`}>
      <body className="h-full antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
