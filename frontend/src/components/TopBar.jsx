import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload } from 'lucide-react'

export default function TopBar({ onUpload }) {
  const fileRef = useRef(null)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          P
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900">
          ProfitPilot
        </span>
      </Link>

      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
      >
        <Upload size={15} strokeWidth={1.75} />
        Upload Data
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls"
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
