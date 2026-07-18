import { useRef } from 'react'
import { Upload } from 'lucide-react'

export default function TopBar({ onUpload }) {
  const fileRef = useRef(null)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[17px] font-medium tracking-tight text-neutral-900">ProfitPilot</span>
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        <Upload size={15} strokeWidth={1.75} />
        Upload data
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.csv,.xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ''
        }}
      />
    </header>
  )
}
