import { AnimatePresence, motion } from 'framer-motion';
import type { AnalyzerError } from '../types';

interface ErrorConsoleProps {
  errors: AnalyzerError[];
  engineLabel?: string;
}

export default function ErrorConsole({ errors, engineLabel }: ErrorConsoleProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel overflow-hidden rounded-3xl border border-red-500/20 shadow-soft"
    >
      <div className="border-b border-red-500/15 bg-red-500/5 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-300/70">Error console</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Lexical diagnostics</h2>
          </div>
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-red-200">
            {engineLabel ?? 'Live'}
          </span>
        </div>
      </div>

      <div className="max-h-[280px] overflow-auto p-4">
        <AnimatePresence initial={false}>
          {errors.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-8 text-center text-sm text-slate-400"
            >
              No lexical errors detected.
            </motion.div>
          ) : (
            errors.map((error, index) => (
              <motion.div
                key={`${error.line}-${index}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-mono text-sm text-red-100 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-red-200/70">
                  ERROR [Line {error.line}{error.column ? `, Column ${error.column}` : ''}]
                </p>
                <p className="mt-2">{error.message}{error.lexeme ? `: ${error.lexeme}` : ''}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
