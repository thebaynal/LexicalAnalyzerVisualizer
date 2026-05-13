import type * as Monaco from 'monaco-editor';
import type { AnalyzerToken, AnalyzerError } from '../types';

const tokenClassMap: Record<string, string> = {
  keyword: 'token-keyword',
  identifier: 'token-identifier',
  integer: 'token-integer',
  float: 'token-float',
  string: 'token-string',
  char: 'token-char',
  operator: 'token-operator',
  punctuation: 'token-punctuation',
  comment: 'token-comment'
};

export function buildTokenDecorations(monaco: typeof Monaco, tokens: AnalyzerToken[], errors: AnalyzerError[]) {
  const tokenDecorations = tokens
    .filter((token) => typeof token.line === 'number' && typeof token.column === 'number')
    .map((token) => {
      const startColumn = Math.max(1, token.column);
      const endColumn = Math.max(startColumn + 1, token.endColumn ?? startColumn + token.lexeme.length);
      return {
        range: new monaco.Range(token.line, startColumn, token.line, endColumn),
        options: {
          inlineClassName: tokenClassMap[token.type] ?? 'token-identifier'
        }
      };
    });

  const errorDecorations = errors
    .filter((error) => typeof error.line === 'number')
    .map((error) => ({
      range: new monaco.Range(error.line, Math.max(1, error.column ?? 1), error.line, Math.max(2, (error.column ?? 1) + 1)),
      options: {
        inlineClassName: 'token-error',
        isWholeLine: false,
        className: 'error-gutter-glow'
      }
    }));

  return [...tokenDecorations, ...errorDecorations];
}
