/* Demonstrates comments and a lexical error */
int main() {
  char *label = "scanner;
  int score = 99;
  score = score @ 2;
  return 0;
}
