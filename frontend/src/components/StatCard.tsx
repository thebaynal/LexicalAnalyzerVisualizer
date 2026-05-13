import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
  note?: string;
}

export default function StatCard({ label, value, accent, note }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel relative overflow-hidden rounded-2xl border border-white/10 p-4 shadow-soft"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-semibold text-white">{value.toLocaleString()}</h3>
        <span className="h-10 w-10 rounded-xl border border-white/10" style={{ background: accent }} />
      </div>
      {note ? <p className="mt-3 text-sm text-slate-400">{note}</p> : null}
    </motion.div>
  );
}
