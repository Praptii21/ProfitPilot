import { useRef, useState } from 'react'
import { Mic, Paperclip, ArrowUp, X, FileText } from 'lucide-react'

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const fileRef = useRef(null)

  // TODO: backend — wire to speech-to-text
  function onVoiceInput() {
    setListening((v) => !v)
  }

  // TODO: backend — POST /ingest with the file
  function onUpload(file) {
    setAttachment(file)
  }

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, attachment)
    setText('')
    setAttachment(null)
  }

  return (
    <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3">
      {attachment && (
        <div className="mb-2 flex">
          <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 py-1 pr-1.5 pl-2.5 text-xs text-neutral-600">
            <FileText size={12} strokeWidth={1.75} />
            {attachment.name}
            <button
              onClick={() => setAttachment(null)}
              className="rounded-full p-0.5 hover:bg-neutral-200"
              aria-label="Remove attachment"
            >
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onVoiceInput}
          aria-label="Voice input"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
            listening
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-neutral-300 text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          <Mic size={16} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-50"
        >
          <Paperclip size={16} strokeWidth={1.75} />
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

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ask about your business..."
          className="h-9 flex-1 rounded-full border border-neutral-300 px-4 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />

        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-30"
        >
          <ArrowUp size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
