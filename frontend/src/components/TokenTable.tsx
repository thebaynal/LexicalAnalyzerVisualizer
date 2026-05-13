import { motion } from 'framer-motion';
import type { ChangeEvent } from 'react';
import type { AnalyzerToken } from '../types';

interface TokenTableProps {
  tokens: AnalyzerToken[];
  query: string;
  onQueryChange: (query: string) => void;
}

const badgeClasses: Record<string, string> = {
  keyword: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  identifier: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  integer: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  float: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  string: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  char: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  operator: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  punctuation: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  comment: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
};

export default function TokenTable({ tokens, query, onQueryChange }: TokenTableProps) {
  const filteredTokens = tokens.filter((token) => {
    const haystack = `${token.type} ${token.lexeme} ${token.line}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-soft"
    >
      <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Token stream</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Structured lexical output</h2>
        </div>
        <div className="w-full sm:w-72">
          <input
            value={query}
            onChange={handleSearchChange}
            placeholder="Search token type or lexeme"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent/60"
          />
        </div>
      </div>

      <div className="max-h-[480px] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur">
            <tr className="text-slate-400">
              <th className="px-5 py-4 font-medium">Type</th>
              <th className="px-5 py-4 font-medium">Lexeme</th>
              <th className="px-5 py-4 font-medium">Line</th>
              <th className="px-5 py-4 font-medium">Column</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                  No tokens match your search.
                </td>
              </tr>
            ) : (
              filteredTokens.map((token, index) => (
                <tr key={`${token.line}-${token.column}-${index}`} className="group border-t border-white/5 transition hover:bg-white/5">
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${badgeClasses[token.type] ?? 'border-white/10 text-slate-300'}`}>
                      {token.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-100">{token.lexeme}</td>
                  <td className="px-5 py-4 text-slate-300">{token.line}</td>
                  <td className="px-5 py-4 text-slate-300">{token.column}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
