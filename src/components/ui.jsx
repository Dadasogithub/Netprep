export function ProgressBar({ value, max = 100, colorClass = "bg-signal-500", trackClass = "bg-mist-200 dark:bg-navy-700", height = "h-2" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`w-full ${height} rounded-full ${trackClass} overflow-hidden`}>
      <div
        className={`${height} rounded-full ${colorClass} transition-all duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const DIFFICULTY_STYLES = {
  Easy: "bg-mint-500/15 text-mint-600 dark:text-mint-500",
  Moderate: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Hard: "bg-rose-500/15 text-rose-600 dark:text-rose-500",
};

export function DifficultyPill({ difficulty }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[difficulty] || ""}`}>
      {difficulty}
    </span>
  );
}

export function TopicPill({ topic }) {
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-signal-500/10 text-signal-600 dark:text-signal-400">
      {topic}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, sublabel, accent = "text-signal-500" }) {
  return (
    <div className="surface rounded-xl p-4 flex items-start gap-3 animate-fade-up">
      {Icon && (
        <div className={`w-9 h-9 rounded-lg bg-current/10 flex items-center justify-center shrink-0 ${accent}`}>
          <Icon size={17} className={accent} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-display font-bold leading-tight">{value}</p>
        <p className="text-xs text-navy-500 dark:text-mist-200/60 mt-0.5">{label}</p>
        {sublabel && <p className="text-[11px] text-navy-400 dark:text-mist-200/40 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="surface rounded-xl p-10 flex flex-col items-center text-center gap-3">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-mist-100 dark:bg-navy-700 flex items-center justify-center">
          <Icon size={20} className="text-navy-400 dark:text-mist-200/50" />
        </div>
      )}
      <div>
        <p className="font-display font-semibold">{title}</p>
        {description && <p className="text-sm text-navy-500 dark:text-mist-200/60 mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-signal-500 hover:bg-signal-600 text-navy-950",
    secondary: "surface hover:bg-mist-100 dark:hover:bg-navy-700",
    ghost: "hover:bg-mist-100 dark:hover:bg-navy-700",
    danger: "bg-rose-500 hover:bg-rose-600 text-white",
    success: "bg-mint-500 hover:bg-mint-600 text-navy-950",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
