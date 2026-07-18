export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            P
          </div>
          <span className="text-sm font-medium text-slate-500">
            ProfitPilot
          </span>
        </div>
        <p className="text-xs text-slate-400">
          © 2026 ProfitPilot · Built for Google "Build with Gemma" AI Sprint
        </p>
      </div>
    </footer>
  )
}
