// src/pages/HomeChat.js
import { useEffect, useRef, useState } from "react";
import MessageBubble from "../components/MessageBubble";

const API_BASE = "http://localhost:8000"; // change when FastAPI ready

export default function HomeChat({ docs, activeDoc, selectedModel, onClearActiveDoc }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        // when doc changes, we can add a system note
        if (activeDoc) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    role: "assistant",
                    content: `🗂 Now focusing on: ${activeDoc.name}`,
                },
            ]);
        }
    }, [activeDoc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;

        const userMsg = { id: Date.now(), role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: text,
                    model: selectedModel,
                    active_doc_id: activeDoc ? activeDoc.id : null,
                }),
            });

            let reply;
            if (res.ok) {
                const data = await res.json();
                reply =
                    data.reply ||
                    "Backend response missing `reply`. Please align FastAPI contract.";
            } else {
                reply =
                    "Server returned an error. Check FastAPI logs / URL configuration.";
            }

            const botMsg = { id: Date.now() + 1, role: "assistant", content: reply };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    role: "assistant",
                    content:
                        "⚠️ Could not reach FastAPI backend at " +
                        API_BASE +
                        ". Is it running?",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasDoc = Boolean(activeDoc);

    return (
        <div className="w-full mx-auto">
            <div
                className={`grid gap-4 ${hasDoc ? "md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]" : ""
                    }`}
            >
                {/* Doc preview column (only if a doc is active) */}
                {hasDoc && (
                    <section className="rounded-xl border border-purple-900/70 bg-[#080024]/80 p-4">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200 mb-2">
                            Doc Preview
                        </h2>
                        <button
                            onClick={onClearActiveDoc}
                            className="text-[11px] px-2 py-0.5 rounded-md border border-purple-700/70 text-purple-200 hover:bg-purple-900/60 transition"
                        >
                            Close
                        </button>
                        <p className="text-sm font-medium truncate mb-1">
                            {activeDoc.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mb-3">
                            This is a placeholder preview. Later you can plug in{" "}
                            <code className="text-[11px] text-purple-300">react-pdf</code> or
                            another viewer to show pages. For now you can explain in the demo
                            that preview is handled client-side.
                        </p>
                        <div className="h-64 rounded-lg border border-purple-900/70 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 flex items-center justify-center text-[11px] text-purple-200/80">
                            PDF preview box
                        </div>
                    </section>
                )}

                {/* Chat panel */}
                <section className="rounded-xl border border-purple-900/70 bg-[#080024]/80 flex flex-col min-h-[420px]">
                    <header className="px-4 pt-3 pb-1 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200">
                                Chat
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                {hasDoc
                                    ? "Answers grounded in selected document + base knowledge."
                                    : "Global mode — answers from project knowledge/base model."}
                            </p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end text-[10px] text-slate-400">
                            <span>Model: {selectedModel}</span>
                            <span>Docs loaded: {docs.length}</span>
                        </div>
                    </header>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-4 pt-2 pb-3 space-y-2"
                    >
                        {messages.length === 0 && (
                            <div className="text-xs text-slate-300 mb-2">
                                Start chatting:
                                <div className="mt-1 space-y-0.5">
                                    <p>• “Give me a high-level summary of these docs.”</p>
                                    <p>• “Explain this like I’m a beginner.”</p>
                                    <p>• “Compare AI and quantum computing sections.”</p>
                                </div>
                            </div>
                        )}
                        {messages.map((m) => (
                            <MessageBubble key={m.id} role={m.role} content={m.content} />
                        ))}
                        {loading && (
                            <div className="text-[11px] text-slate-400 animate-pulse">
                                RAG assistant is thinking…
                            </div>
                        )}
                    </div>

                    {/* Input + model info */}
                    <div className="border-t border-purple-900/70 px-4 py-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-end gap-2">
                                <textarea
                                    className="flex-1 resize-none bg-[#040017] border border-purple-800/70 rounded-lg px-3 py-2 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-400"
                                    rows={1}
                                    placeholder="Ask anything… (works even before docs are uploaded)"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="shrink-0 px-3 py-2 rounded-lg text-xs md:text-sm font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(129,140,248,0.75)] hover:shadow-[0_0_24px_rgba(129,140,248,1)] transition"
                                >
                                    ➤
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Current mode:{" "}
                                <span className="text-purple-200">
                                    {hasDoc ? "doc-aware" : "global"}
                                </span>{" "}
                                • Model selector at top bar (Groq / OpenAI / Gemini).
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}










// import { useEffect, useRef, useState } from "react";
// import MessageBubble from "../components/MessageBubble";

// export default function HomeChat() {
//     const [messages, setMessages] = useState([
//         {
//             id: 1,
//             role: "assistant",
//             content:
//                 "Hey 👋 I’m your RAG Assistant.\nUpload docs to the backend, then ask me anything. I’ll answer from your knowledge base.",
//         },
//     ]);
//     const [input, setInput] = useState("");
//     const [loading, setLoading] = useState(false);
//     const scrollRef = useRef(null);

//     useEffect(() => {
//         if (scrollRef.current) {
//             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//         }
//     }, [messages, loading]);

//     const handleSend = async () => {
//         const text = input.trim();
//         if (!text) return;

//         const userMsg = {
//             id: Date.now(),
//             role: "user",
//             content: text,
//         };

//         setMessages((prev) => [...prev, userMsg]);
//         setInput("");
//         setLoading(true);

//         try {
//             const res = await fetch("http://localhost:8000/chat", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     query: text,
//                 }),
//             });

//             if (!res.ok) {
//                 throw new Error("Backend error");
//             }

//             const data = await res.json();

//             const botMsg = {
//                 id: Date.now() + 1,
//                 role: "assistant",
//                 content: data.reply || "I got your question, but I couldn’t generate a reply.",
//             };

//             setMessages((prev) => [...prev, botMsg]);
//         } catch (err) {
//             console.error(err);
//             setMessages((prev) => [
//                 ...prev,
//                 {
//                     id: Date.now() + 2,
//                     role: "assistant",
//                     content:
//                         "⚠️ I couldn’t reach the backend. Is FastAPI running on localhost:8000?",
//                 },
//             ]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             handleSend();
//         }
//     };

//     return (
//         <div
//             className="
//         flex flex-col h-full
//         bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950
//       "
//         >
//             {/* top bar */}
//             <header className="px-4 py-3 border-b border-indigo-500/20 flex items-center justify-between">
//                 <div>
//                     <h2 className="text-sm font-semibold text-indigo-100">
//                         Chat with RAG Assistant
//                     </h2>
//                     <p className="text-[11px] text-slate-400">
//                         Ask questions from your documents. Answers are grounded in context.
//                     </p>
//                 </div>
//                 <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
//                     ● Online
//                 </span>
//             </header>

//             {/* chat area */}
//             <div className="flex-1 overflow-hidden">
//                 <div
//                     ref={scrollRef}
//                     className="h-full overflow-y-auto px-4 py-4 space-y-2"
//                 >
//                     {messages.map((m) => (
//                         <MessageBubble key={m.id} role={m.role} content={m.content} />
//                     ))}

//                     {loading && (
//                         <div className="text-xs text-slate-400 animate-pulse mt-2">
//                             RAG Assistant is thinking…
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* input area */}
//             <div className="border-t border-indigo-500/30 bg-black/30 backdrop-blur-xl px-4 py-3">
//                 <div className="max-w-3xl mx-auto flex gap-2 items-end">
//                     <textarea
//                         className="
//               flex-1 resize-none rounded-2xl px-3 py-2 text-sm
//               bg-slate-900/80 border border-indigo-500/30
//               focus:outline-none focus:ring-2 focus:ring-indigo-400/70
//               text-slate-100 placeholder:text-slate-500
//             "
//                         rows={1}
//                         placeholder="Ask something from your docs…"
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                     />
//                     <button
//                         onClick={handleSend}
//                         disabled={loading || !input.trim()}
//                         className="
//               px-4 py-2 rounded-2xl text-sm font-medium
//               bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400
//               disabled:opacity-40 disabled:cursor-not-allowed
//               shadow-[0_0_16px_rgba(129,140,248,0.8)]
//               hover:shadow-[0_0_26px_rgba(129,140,248,1)]
//               transition
//             "
//                     >
//                         ➤
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
