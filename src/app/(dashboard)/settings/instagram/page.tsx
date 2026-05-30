import { getSocialToken, getLatestSocialInsight } from "@/actions/social.actions"
import { InstagramSettingsClient } from "@/components/settings/InstagramSettingsClient"
import { CheckCircle, AlertCircle, Users, TrendingUp, Eye, RefreshCw } from "lucide-react"

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

function StatBox({ label, value, icon }: { label: string; value: string | null; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4">
      <div className="flex items-center gap-2 text-[hsl(25,10%,50%)] text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-[hsl(25,20%,15%)]">{value ?? "—"}</p>
    </div>
  )
}

export default async function InstagramSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
  const [token, insight] = await Promise.all([
    getSocialToken("instagram"),
    getLatestSocialInsight("instagram"),
  ])

  const isConnected = !!token
  const hasAppConfig = !!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID

  const fetchedAgo = insight?.fetched_at
    ? formatDistanceToNow(new Date(insight.fetched_at), { addSuffix: true, locale: th })
    : null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">Instagram Insights</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">
          เชื่อม Instagram เพื่อแสดงยอด followers และ engagement บน Rate Card
        </p>
      </div>

      {/* Success/error alerts */}
      {params.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          เชื่อม Instagram สำเร็จ! ข้อมูล Insights ถูกบันทึกแล้ว
        </div>
      )}
      {params.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 space-y-1">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">เกิดข้อผิดพลาด</span>
          </div>
          <p className="pl-7">{decodeURIComponent(params.error)}</p>
        </div>
      )}

      {/* Connection status */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isConnected ? "bg-green-50" : "bg-orange-50"}`}>
            {isConnected
              ? <CheckCircle className="w-5 h-5 text-green-600" />
              : <IgIcon className="w-5 h-5 text-[hsl(24,85%,50%)]" />
            }
          </div>
          <div className="flex-1 min-w-0">
            {isConnected ? (
              <>
                <p className="text-sm font-semibold text-[hsl(25,20%,15%)]">เชื่อมแล้ว</p>
                {token.ig_username && (
                  <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5">@{token.ig_username}</p>
                )}
                {token.page_name && (
                  <p className="text-xs text-[hsl(25,10%,60%)] mt-0.5">Page: {token.page_name}</p>
                )}
                {token.expires_at && (
                  <p className="text-xs text-[hsl(25,10%,60%)] mt-0.5">
                    Token หมดอายุ: {new Date(token.expires_at).toLocaleDateString("th-TH")}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[hsl(25,20%,15%)]">ยังไม่ได้เชื่อม Instagram</p>
                <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5">
                  เชื่อมต่อเพื่อดึง followers, reach, และ demographic data โดยอัตโนมัติ
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Insights stats */}
      {insight && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[hsl(25,20%,15%)]">Insights ล่าสุด</h2>
            {fetchedAgo && (
              <span className="text-xs text-[hsl(25,10%,55%)] flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                อัปเดต {fetchedAgo}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Followers"
              value={insight.followers != null ? insight.followers.toLocaleString() : null}
              icon={<Users className="w-3.5 h-3.5" />}
            />
            <StatBox
              label="Avg. Reach / วัน"
              value={insight.avg_reach != null ? Math.round(insight.avg_reach).toLocaleString() : null}
              icon={<Eye className="w-3.5 h-3.5" />}
            />
            <StatBox
              label="Engagement Rate"
              value={insight.engagement_rate != null ? `${insight.engagement_rate}%` : null}
              icon={<TrendingUp className="w-3.5 h-3.5" />}
            />
            <StatBox
              label="โพสทั้งหมด"
              value={insight.media_count != null ? insight.media_count.toLocaleString() : null}
              icon={<IgIcon className="w-3.5 h-3.5" />}
            />
          </div>
        </div>
      )}

      {/* Connect/Disconnect button */}
      <InstagramSettingsClient isConnected={isConnected} igUsername={token?.ig_username ?? null} />

      {/* Setup instructions (shown when not configured) */}
      {!hasAppConfig && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-amber-800">ต้องตั้งค่า Facebook App ก่อน</h3>
          <ol className="text-xs text-amber-700 space-y-2 list-decimal list-inside">
            <li>ไปที่ <span className="font-mono bg-white px-1 rounded">developers.facebook.com</span> → สร้าง App ใหม่ (ประเภท Business)</li>
            <li>เพิ่ม Product: <strong>Facebook Login</strong> และ <strong>Instagram Graph API</strong></li>
            <li>ตั้ง Valid OAuth Redirect URIs เป็น <span className="font-mono bg-white px-1 rounded">[URL]/api/instagram/callback</span></li>
            <li>เพิ่ม env vars:<br />
              <code className="block bg-white px-2 py-1 rounded mt-1 font-mono text-xs">
                NEXT_PUBLIC_FACEBOOK_APP_ID=&lt;App ID&gt;<br />
                FACEBOOK_APP_SECRET=&lt;App Secret&gt;
              </code>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
