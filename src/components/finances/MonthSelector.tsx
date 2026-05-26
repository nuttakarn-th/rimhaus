"use client"

interface Props {
  month: string
  type?: string
}

export function MonthSelector({ month, type }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = new URL(window.location.href)
    url.searchParams.set("month", e.target.value)
    if (type && type !== "all") {
      url.searchParams.set("type", type)
    } else {
      url.searchParams.delete("type")
    }
    window.location.href = url.toString()
  }

  return (
    <input
      type="month"
      defaultValue={month}
      onChange={handleChange}
      className="text-sm border border-[hsl(35,20%,88%)] rounded-lg px-3 py-1.5 bg-white"
    />
  )
}
