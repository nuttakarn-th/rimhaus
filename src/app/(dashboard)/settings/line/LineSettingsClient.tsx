"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getLinkToken, unlinkLineAccount } from "@/actions/line.actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Link2Off, RefreshCw } from "lucide-react"

interface Props {
  isLinked: boolean
}

export function LineSettingsClient({ isLinked }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
      if (diff === 0) {
        setToken(null)
        setExpiresAt(null)
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  async function handleGenerateToken() {
    setLoading(true)
    try {
      const result = await getLinkToken()
      if (!result) {
        toast.error("ไม่สามารถสร้าง Token ได้")
        return
      }
      setToken(result.token)
      setExpiresAt(new Date(result.expiresAt))
      setSecondsLeft(600)
    } catch {
      toast.error("เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  async function handleUnlink() {
    if (!confirm("ยกเลิกการเชื่อม LINE ใช่มั้ย?")) return
    setLoading(true)
    try {
      const result = await unlinkLineAccount()
      if (!result.success) {
        toast.error("ไม่สามารถยกเลิกการเชื่อมได้")
        return
      }
      toast.success("ยกเลิกการเชื่อม LINE แล้ว")
      router.refresh()
    } catch {
      toast.error("เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, "0")}`
  }

  if (isLinked) {
    return (
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5">
        <h2 className="text-sm font-semibold text-[hsl(25,20%,15%)] mb-3">
          จัดการการเชื่อมต่อ
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={handleUnlink}
          disabled={loading}
        >
          <Link2Off className="w-3.5 h-3.5 mr-1.5" />
          ยกเลิกการเชื่อม LINE
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[hsl(25,20%,15%)]">
        สร้าง Token เชื่อม LINE
      </h2>

      {!token ? (
        <Button onClick={handleGenerateToken} disabled={loading} size="sm">
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : null}
          สร้าง Token
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Big token display */}
          <div className="bg-[hsl(35,30%,97%)] border-2 border-[hsl(24,85%,50%)] rounded-xl p-6 text-center">
            <p className="text-xs text-[hsl(25,10%,50%)] mb-2">Token ของคุณ</p>
            <p className="text-4xl font-bold tracking-[0.3em] text-[hsl(24,85%,45%)] font-mono">
              {token}
            </p>
            <p className="text-xs text-[hsl(25,10%,55%)] mt-3">
              หมดอายุใน{" "}
              <span className={`font-semibold ${secondsLeft < 60 ? "text-red-500" : "text-[hsl(24,85%,45%)]"}`}>
                {formatTime(secondsLeft)}
              </span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-700 mb-1">วิธีเชื่อม LINE</p>
            <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
              <li>เปิด LINE แล้วไปที่ chat กับ Rimhaus Bot</li>
              <li>
                ส่งข้อความ:{" "}
                <code className="bg-white border border-blue-200 px-1.5 py-0.5 rounded font-mono text-blue-700">
                  เชื่อม {token}
                </code>
              </li>
              <li>รอรับข้อความยืนยัน</li>
            </ol>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateToken}
            disabled={loading}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            สร้าง Token ใหม่
          </Button>
        </div>
      )}
    </div>
  )
}
