import type { AnalysisResponse, ExampleSnippet } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function analyzeCode(code: string): Promise<AnalysisResponse> {
  return requestJson<AnalysisResponse>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

export async function fetchExamples(): Promise<ExampleSnippet[]> {
  const payload = await requestJson<{ examples: ExampleSnippet[] }>('/api/examples');
  return payload.examples;
}

export async function fetchHealth(): Promise<{ ok: boolean; lexer: string; backend: string; executablePath?: string }> {
  return requestJson('/api/health');
}
