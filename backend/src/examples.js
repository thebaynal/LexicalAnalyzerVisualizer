export const examples = [
  {
    id: 'hello-c',
    title: 'Minimal function',
    language: 'C',
    description: 'Function declaration, arithmetic, and return flow.',
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
    language: 'C',
    description: 'Keywords, relational operators, and comments.',
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
    language: 'C',
    description: 'Invalid characters and malformed string literals.',
    code: `int main() {
  char *name = "Lexical Analyzer;
  int score = 90;
  score = score @ 2;
  return 0;
}`
  }
];

export function getExampleById(id) {
  return examples.find((example) => example.id === id) ?? examples[0];
}
