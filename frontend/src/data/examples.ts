import type { ExampleSnippet } from '../types';

export const exampleSnippets: ExampleSnippet[] = [
  {
    id: 'hello-c',
    title: 'Minimal function',
    description: 'Function declaration, arithmetic, and return flow.',
    language: 'C',
    code: `#include <stdio.h>

int main(void) {
  int value = 42;
  float ratio = value / 3.0;
  if (ratio >= 10.0) {
    printf("Ready: %f\n", ratio);
  }
  return 0;
}`
  },
  {
    id: 'control-flow',
    title: 'Branching and loop',
    description: 'Keywords, relational operators, and comments.',
    language: 'C',
    code: `/* Count odd numbers in a range */
int countOdds(int start, int end) {
  int count = 0;
  for (int i = start; i <= end; i++) {
    if (i % 2 != 0) {
      count++;
    }
  }
  return count;
}`
  },
  {
    id: 'error-sample',
    title: 'Error showcase',
    description: 'Invalid characters and malformed string literals.',
    language: 'C',
    code: `int main() {
  char *name = "Lexical Analyzer;
  int score = 90;
  score = score @ 2;
  return 0;
}`
  }
];
