export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-emerald-50 px-4 py-2.5 text-[15px] leading-relaxed text-emerald-950">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-neutral-800">
        {message.content}
      </div>
    </div>
  )
}
