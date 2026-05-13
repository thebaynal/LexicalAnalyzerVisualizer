import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Trash2, FolderInput, FileText } from 'lucide-react';
import type * as Monaco from 'monaco-editor';
import type { AnalyzerError, AnalyzerToken, ExampleSnippet } from '../types';
import { buildTokenDecorations } from '../lib/monacoDecorations';

interface CodeEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onUploadFile: (file: File) => void;
  onLoadExample: (snippet: ExampleSnippet) => void;
  examples: ExampleSnippet[];
  selectedExampleId: string;
  isAnalyzing: boolean;
  tokens: AnalyzerToken[];
  errors: AnalyzerError[];
  themeName: string;
  onThemeToggle: () => void;
}

export default function CodeEditorPanel({
  code,
  onCodeChange,
  onAnalyze,
  onClear,
  onUploadFile,
  onLoadExample,
  examples,
  selectedExampleId,
  isAnalyzing,
  tokens,
  errors,
  themeName,
  onThemeToggle
}: CodeEditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const activeExample = useMemo(() => examples.find((snippet) => snippet.id === selectedExampleId) ?? examples[0], [examples, selectedExampleId]);

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const decorations = buildTokenDecorations(monacoRef.current, tokens, errors);
    decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, decorations);
  };

  useEffect(() => {
    updateDecorations();
  }, [tokens, errors]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme('lexical-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'a855f7' },
        { token: 'identifier', foreground: '22d3ee' },
        { token: 'number', foreground: '4ade80' }
      ],
      colors: {
        'editor.background': '#0b1220',
        'editor.lineHighlightBackground': '#182338',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#1d4ed833',
        'editor.inactiveSelectionBackground': '#1d4ed822'
      }
    });
    monaco.editor.setTheme('lexical-dark');
    updateDecorations();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    onUploadFile(file);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`glass-panel rounded-3xl border shadow-soft transition ${isDragging ? 'border-accent/60 shadow-[0_0_0_1px_rgba(56,189,248,0.3),0_30px_80px_rgba(15,23,42,0.5)]' : 'border-white/10'}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Editor workspace</p>
          <h2 className="mt-2 text-xl font-semibold text-white">C language source input</h2>
          <p className="mt-2 text-sm text-slate-400">Edit code, upload a file, or load a sample to stream tokens into the dashboard.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onThemeToggle} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
            Theme: {themeName}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
            <Upload size={16} /> Upload File
          </button>
          <button onClick={() => onLoadExample(activeExample)} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20">
            <FolderInput size={16} /> Load Example
          </button>
          <button onClick={onAnalyze} disabled={isAnalyzing} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">
            <Sparkles size={16} /> {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
          </button>
          <button onClick={onClear} className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-100 transition hover:bg-red-500/20">
            <Trash2 size={16} /> Clear
          </button>
          <input ref={fileInputRef} type="file" accept=".c,.h,.txt,.cpp,.java,.py" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
          <Editor
            height="620px"
            language="c"
            value={code}
            onChange={(value) => onCodeChange(value ?? '')}
            onMount={handleMount}
            theme="lexical-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              lineHeight: 24,
              roundedSelection: true,
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              },
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              automaticLayout: true,
              wordWrap: 'on',
              padding: { top: 18, bottom: 18 },
              fontLigatures: true,
              renderLineHighlight: 'all',
              renderValidationDecorations: 'on'
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Example loaded</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{activeExample.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{activeExample.description}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <FileText size={14} /> {activeExample.language} subset
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Samples</p>
            <div className="mt-3 space-y-3">
              {examples.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => onLoadExample(snippet)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedExampleId === snippet.id ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-white">{snippet.title}</span>
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-400">{snippet.language}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{snippet.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
