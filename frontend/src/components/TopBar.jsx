import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Moon, Sun, Target } from 'lucide-react'

export default function TopBar({ onUpload, isUploading }) {
  const fileRef = useRef(null)
  
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  // Initialize theme from local storage on mount
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      setIsDark(true)
    }
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 transition-colors">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
          P
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          ProfitPilot
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <Link
          to="/goals"
          id="tour-goals"
          className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Target size={16} strokeWidth={1.75} />
          Goals
        </Link>

        <button
          onClick={() => !isUploading && fileRef.current?.click()}
          disabled={isUploading}
          id="tour-upload"
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ${
            isUploading 
              ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 opacity-50 cursor-not-allowed text-slate-500 dark:text-slate-400' 
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700'
          }`}
        >
          {isUploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300" />
          ) : (
            <Upload size={15} strokeWidth={1.75} />
          )}
          {isUploading ? 'Analyzing...' : 'Upload Data'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls,image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length > 0) onUpload(files)
          e.target.value = ''
        }}
      />
    </header>
  )
}
