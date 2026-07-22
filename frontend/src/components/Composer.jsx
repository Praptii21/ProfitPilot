import { useRef, useState } from 'react'
import { Mic, Paperclip, ArrowUp, X, FileText } from 'lucide-react'

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const fileRef = useRef(null)
  const recognitionRef = useRef(null)

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setText((prev) => prev ? prev + ' ' + transcript : transcript)
      setListening(false)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">


      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Voice button */}
        <button
          onClick={startVoice}
          aria-label="Voice input"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
            listening
              ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Mic size={16} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
        </button>

        {/* Attach button */}
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <Paperclip size={16} strokeWidth={1.75} />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,image/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length > 0) {
              // Directly trigger upload via onSend with null text and files as attachment
              onSend('', files)
            }
            e.target.value = ''
          }}
        />

        {/* Text input */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ask about your business..."
          className="h-9 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
        />

        {/* Send button */}
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Send"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
            text.trim()
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ArrowUp size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Voice listening indicator */}
      {listening && (
        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          Listening... speak now
        </div>
      )}
    </div>
  )
}
