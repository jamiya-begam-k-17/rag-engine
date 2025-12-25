// src/components/Card.js
export default function Card({ title, badge, children, className = "" }) {
    return (
        <section
            className={
                "rounded-2xl border border-purple-700/40 bg-gradient-to-br from-[#120322]/80 via-[#050013]/80 to-[#020617]/80 " +
                "shadow-[0_0_30px_rgba(88,28,135,0.45)] hover:shadow-[0_0_45px_rgba(94,92,230,0.65)] " +
                "transition-transform duration-200 hover:-translate-y-0.5 " +
                className
            }
        >
            <header className="px-4 pt-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-purple-200">
                    {title}
                </h2>
                {badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-400/60 text-indigo-200">
                        {badge}
                    </span>
                )}
            </header>
            <div className="px-4 pb-4 pt-2 text-sm text-slate-100">{children}</div>
        </section>
    );
}
