import { useEffect, useState } from 'react';
import { Download, MoonStar, SunMedium, Cpu, FileDown, LoaderCircle } from 'lucide-react';
import CodeEditorPanel from './components/CodeEditorPanel';
import StatCard from './components/StatCard';
import TokenTable from './components/TokenTable';
import ErrorConsole from './components/ErrorConsole';
import AnalysisCharts from './components/AnalysisCharts';
import { exampleSnippets } from './data/examples';
import { analyzeCode, fetchHealth } from './lib/api';
import { downloadJson, downloadText } from './lib/download';
import type { AnalysisResponse, AnalyzerError, AnalyzerToken, ExampleSnippet } from './types';

const defaultExample = exampleSnippets[0];

const themeLabels = ['Midnight', 'Aurora'];

function App() {
  const [code, setCode] = useState(defaultExample.code);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [tokens, setTokens] = useState<AnalyzerToken[]>([]);
  const [errors, setErrors] = useState<AnalyzerError[]>([]);
  const [search, setSearch] = useState('');
  const [selectedExampleId, setSelectedExampleId] = useState(defaultExample.id);
  const [themeIndex, setThemeIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Waiting for code input');
  const [engineBadge, setEngineBadge] = useState('Flex-ready');

  useEffect(() => {
    document.documentElement.dataset.theme = themeIndex === 0 ? 'midnight' : 'aurora';
  }, [themeIndex]);

  useEffect(() => {
    fetchHealth()
      .then((health) => {
        setEngineBadge(health.lexer === 'flex' ? 'Flex engine' : 'Fallback lexer');
      })
      .catch(() => {
        setEngineBadge('Offline');
      });
  }, []);

  useEffect(() => {
    if (!code.trim()) {
      setTokens([]);
      setErrors([]);
      setAnalysis(null);
      setStatusMessage('Enter or load a C snippet to begin');
      return;
    }

    const timeout = window.setTimeout(() => {
      void runAnalysis(code);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [code]);

  async function runAnalysis(source = code) {
    if (!source.trim()) {
      setTokens([]);
      setErrors([]);
      setAnalysis(null);
      setStatusMessage('Enter code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage('Scanning source with the lexer');
    try {
      const result = await analyzeCode(source);
      setAnalysis(result);
      setTokens(result.tokens);
      setErrors(result.errors);
      setStatusMessage(result.engine === 'flex' ? 'Flex scan complete' : 'Fallback analysis complete');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setStatusMessage(message);
      setErrors([
        {
          kind: 'error',
          message,
          line: 1,
          column: 1
        }
      ]);
      setTokens([]);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const stats = analysis?.stats ?? {
    totalTokens: 0,
    keywords: 0,
    identifiers: 0,
    literals: 0,
    operators: 0,
    comments: 0,
    errors: 0
  };

  const filteredErrors = errors;
  const filteredTokens = tokens;

  const loadExample = (snippet: ExampleSnippet) => {
    setSelectedExampleId(snippet.id);
    setCode(snippet.code);
    setSearch('');
  };

  const handleClear = () => {
    setCode('');
    setSelectedExampleId(defaultExample.id);
    setTokens([]);
    setErrors([]);
    setAnalysis(null);
    setSearch('');
    setStatusMessage('Editor cleared');
  };

  const handleUpload = async (file: File) => {
    const text = await file.text();
    setCode(text);
    setStatusMessage(`Loaded ${file.name}`);
  };

  const handleDownloadJson = () => {
    downloadJson('lexical-analysis-report.json', {
      analysis,
      code
    });
  };

  const handleDownloadTxt = () => {
    const reportLines = [
      'Lexical Analyzer Visualizer Report',
      '----------------------------------',
      `Engine: ${analysis?.engine ?? 'n/a'}`,
      `Total tokens: ${stats.totalTokens}`,
      `Keywords: ${stats.keywords}`,
      `Identifiers: ${stats.identifiers}`,
      `Literals: ${stats.literals}`,
      `Operators: ${stats.operators}`,
      `Comments: ${stats.comments}`,
      `Errors: ${stats.errors}`,
      '',
      'Tokens:',
      ...filteredTokens.map((token) => `${token.line}:${token.column} ${token.type} -> ${token.lexeme}`),
      '',
      'Errors:',
      ...filteredErrors.map((error) => `${error.line}:${error.column ?? 1} ${error.message}`)
    ];

    downloadText('lexical-analysis-report.txt', reportLines.join('\n'));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.12),_transparent_30%),linear-gradient(180deg,_#0f172a_0%,_#0b1220_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-6 px-4 py-4 lg:px-6">
        <header className="glass-panel flex flex-col gap-5 rounded-[2rem] border border-white/10 px-5 py-5 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">
              <Cpu size={14} /> Compiler visualization workstation
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Lexical Analyzer Visualizer
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
              A polished compiler-design interface that tokenizes C source code through a Flex-powered backend and renders the lexical stream as an interactive, educational dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100">
              {engineBadge}
            </span>
            <button
              onClick={() => setThemeIndex((current) => (current + 1) % themeLabels.length)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            >
              {themeIndex === 0 ? <MoonStar size={16} /> : <SunMedium size={16} />}
              {themeLabels[themeIndex]}
            </button>
            <button onClick={handleDownloadTxt} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
              <Download size={16} /> TXT Report
            </button>
            <button onClick={handleDownloadJson} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-950 transition hover:scale-[1.01]">
              <FileDown size={16} /> JSON Report
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <CodeEditorPanel
              code={code}
              onCodeChange={setCode}
              onAnalyze={() => void runAnalysis(code)}
              onClear={handleClear}
              onUploadFile={handleUpload}
              onLoadExample={loadExample}
              examples={exampleSnippets}
              selectedExampleId={selectedExampleId}
              isAnalyzing={isAnalyzing}
              tokens={tokens}
              errors={errors}
              themeName={themeLabels[themeIndex]}
              onThemeToggle={() => setThemeIndex((current) => (current + 1) % themeLabels.length)}
            />
          </div>

          <div className="space-y-6">
            <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <StatCard label="Total tokens" value={stats.totalTokens} accent="linear-gradient(135deg, rgba(56,189,248,0.95), rgba(14,165,233,0.55))" note="All classified lexemes" />
              <StatCard label="Keywords" value={stats.keywords} accent="linear-gradient(135deg, rgba(168,85,247,0.95), rgba(129,140,248,0.55))" note="Reserved words detected" />
              <StatCard label="Identifiers" value={stats.identifiers} accent="linear-gradient(135deg, rgba(34,211,238,0.95), rgba(14,165,233,0.55))" note="Names and symbols" />
              <StatCard label="Literals" value={stats.literals} accent="linear-gradient(135deg, rgba(74,222,128,0.95), rgba(34,197,94,0.55))" note="Numeric and quoted values" />
              <StatCard label="Operators" value={stats.operators} accent="linear-gradient(135deg, rgba(251,146,60,0.95), rgba(249,115,22,0.55))" note="Arithmetic and logic tokens" />
              <StatCard label="Errors" value={stats.errors} accent="linear-gradient(135deg, rgba(239,68,68,0.95), rgba(248,113,113,0.55))" note="Invalid or malformed input" />
            </section>

            <div className="glass-panel rounded-3xl border border-white/10 p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Analysis session</h2>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  {isAnalyzing ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={12} className="animate-spin" /> Processing
                    </span>
                  ) : (
                    'Ready'
                  )}
                </span>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                {statusMessage}
              </div>
            </div>

            <AnalysisCharts stats={stats} />

            <TokenTable tokens={filteredTokens} query={search} onQueryChange={setSearch} />
            <ErrorConsole errors={filteredErrors} engineLabel={analysis?.engine === 'flex' ? 'Flex output' : 'Live diagnostics'} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
