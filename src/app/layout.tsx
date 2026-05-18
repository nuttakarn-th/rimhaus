import type { Metadata } from "next"
import { Noto_Sans_Thai } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-thai",
})

export const metadata: Metadata = {
  title: "Rimhaus — จัดการธุรกิจเพจแต่งบ้าน",
  description: "ระบบจัดการงานรีวิว การเงิน และคอนเทนต์สำหรับเพจแต่งบ้าน",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full ${notoSansThai.variable}`}>
      <body className="h-full antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
