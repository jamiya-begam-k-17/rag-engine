export default function MessageBubble({ role, content }) {
    const isUser = role === "user";

    return (
        <div
            className={`
        flex mb-3
        ${isUser ? "justify-end" : "justify-start"}
      `}
        >
            <div
                className={`
          max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed
          shadow-[0_0_18px_rgba(56,189,248,0.25)]
          ${isUser
                        ? "bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-900"
                        : "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/40 text-slate-100"}
        `}
            >
                {!isUser && (
                    <div className="text-[10px] uppercase tracking-wide text-indigo-300/80 mb-1">
                        RAG Assistant
                    </div>
                )}
                {isUser && (
                    <div className="text-[10px] uppercase tracking-wide text-slate-900/70 mb-1">
                        You
                    </div>
                )}
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    );
}
