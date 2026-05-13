import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import type { AnalyzerStats } from '../types';

interface AnalysisChartsProps {
  stats: AnalyzerStats;
}

const chartColors = ['#a855f7', '#22d3ee', '#4ade80', '#fb923c', '#ef4444', '#38bdf8'];

export default function AnalysisCharts({ stats }: AnalysisChartsProps) {
  const chartData = [
    { name: 'Keywords', value: stats.keywords },
    { name: 'Identifiers', value: stats.identifiers },
    { name: 'Literals', value: stats.literals },
    { name: 'Operators', value: stats.operators },
    { name: 'Errors', value: stats.errors }
  ];

  const pieData = chartData.filter((item) => item.value > 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
      <section className="glass-panel rounded-3xl border border-white/10 p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Distribution</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Token category overview</h2>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.16)" />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-panel rounded-3xl border border-white/10 p-5 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Composition</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Live token mix</h2>
        <div className="mt-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={52} paddingAngle={5}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  color: '#e2e8f0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: chartColors[index % chartColors.length] }} />
                {item.name}
              </span>
              <strong className="text-white">{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
