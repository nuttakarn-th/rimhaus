import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-[hsl(35,20%,88%)]">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🏠</div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">Rimhaus</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">ระบบจัดการธุรกิจเพจแต่งบ้าน</p>
      </div>
      <LoginForm />
    </div>
  )
}
