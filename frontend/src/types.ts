export type TokenType =
  | 'keyword'
  | 'identifier'
  | 'integer'
  | 'float'
  | 'string'
  | 'char'
  | 'operator'
  | 'punctuation'
  | 'comment';

export interface AnalyzerToken {
  kind: 'token';
  type: TokenType | string;
  lexeme: string;
  line: number;
  column: number;
  endColumn?: number;
}

export interface AnalyzerError {
  kind: 'error';
  message: string;
  lexeme?: string;
  line: number;
  column?: number;
}

export interface AnalyzerStats {
  totalTokens: number;
  keywords: number;
  identifiers: number;
  literals: number;
  operators: number;
  comments: number;
  errors: number;
}

export interface AnalysisResponse {
  engine: string;
  language: string;
  tokens: AnalyzerToken[];
  errors: AnalyzerError[];
  stats: AnalyzerStats;
}

export interface ExampleSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
}
