import { motion } from 'framer-motion'
import { X, MessageSquare, Trash2, Plus } from 'lucide-react'

export default function ChatHistory({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onLoadSession,
  onNewSession,
  onDeleteSession
}) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 shadow-2xl flex flex-col h-full text-slate-900 dark:text-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
            Chat Sessions
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <button
          onClick={() => {
            onNewSession()
            onClose()
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all mb-4"
        >
          <Plus size={16} />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
              No saved sessions yet.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-900/50'
                  }`}
                  onClick={() => {
                    onLoadSession(session.id)
                    onClose()
                  }}
                >
                  <div className="min-w-0 flex-1 pr-6">
                    <h3 className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                      {session.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    aria-label="Delete Session"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
