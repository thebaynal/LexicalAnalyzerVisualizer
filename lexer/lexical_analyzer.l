%option noyywrap
%option nodefault

%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int current_line = 1;
static int current_column = 1;

static void print_json_string(const char *text, int length) {
  putchar('"');
  for (int index = 0; index < length; ++index) {
    unsigned char ch = (unsigned char)text[index];
    switch (ch) {
      case '"': fputs("\\\"", stdout); break;
      case '\\': fputs("\\\\", stdout); break;
      case '\b': fputs("\\b", stdout); break;
      case '\f': fputs("\\f", stdout); break;
      case '\n': fputs("\\n", stdout); break;
      case '\r': fputs("\\r", stdout); break;
      case '\t': fputs("\\t", stdout); break;
      default:
        if (ch < 0x20) {
          fprintf(stdout, "\\u%04x", ch);
        } else {
          putchar(ch);
        }
        break;
    }
  }
  putchar('"');
}

static void advance_position(const char *text, int length) {
  for (int index = 0; index < length; ++index) {
    if (text[index] == '\n') {
      current_line += 1;
      current_column = 1;
    } else {
      current_column += 1;
    }
  }
}

static void emit_token(const char *type, const char *lexeme, int length, int line, int column) {
  int end_column = column;
  for (int index = 0; index < length; ++index) {
    if (lexeme[index] == '\n') {
      end_column = 1;
    } else {
      end_column += 1;
    }
  }

  fputs("{\"kind\":\"token\",\"type\":", stdout);
  print_json_string(type, (int)strlen(type));
  fputs(",\"lexeme\":", stdout);
  print_json_string(lexeme, length);
  fprintf(stdout, ",\"line\":%d,\"column\":%d,\"endColumn\":%d}\n", line, column, end_column);
}

static void emit_error(const char *message, const char *lexeme, int length, int line, int column) {
  fputs("{\"kind\":\"error\",\"message\":", stdout);
  print_json_string(message, (int)strlen(message));
  fputs(",\"lexeme\":", stdout);
  print_json_string(lexeme, length);
  fprintf(stdout, ",\"line\":%d,\"column\":%d}\n", line, column);
}

#define START_LINE current_line
#define START_COLUMN current_column
%}

DIGIT      [0-9]
LETTER     [A-Za-z_]
ID         {LETTER}({LETTER}|{DIGIT})*
INT        {DIGIT}+
FLOAT      (({DIGIT}+\.{DIGIT}*|\.{DIGIT}+)([eE][+-]?{DIGIT}+)?|{DIGIT}+[eE][+-]?{DIGIT}+)
STRING     \"([^\"\\\n]|\\.)*\"
CHAR       \'([^\'\\\n]|\\.)\'
LINECMT    \/\/[^\n]*
BLOCKCMT   \/\*([^*]|\*+[^*/])*\*+\/
UNTERMINATED_BLOCKCMT \/\*([^*]|\*+[^*/])*$
UNTERMINATED_STRING    \"([^\"\\\n]|\\.)*\n?
UNTERMINATED_CHAR      \'([^\'\\\n]|\\.)*\n?

%%

"auto"|"break"|"case"|"char"|"const"|"continue"|"default"|"do"|"double"|"else"|"enum"|"extern"|"float"|"for"|"goto"|"if"|"inline"|"int"|"long"|"register"|"restrict"|"return"|"short"|"signed"|"sizeof"|"static"|"struct"|"switch"|"typedef"|"union"|"unsigned"|"void"|"volatile"|"while"|"_Bool"|"_Complex"|"_Imaginary" {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("keyword", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{ID} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("identifier", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{FLOAT} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("float", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{INT} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("integer", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{STRING} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("string", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{CHAR} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("char", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{LINECMT} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("comment", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{BLOCKCMT} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("comment", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{UNTERMINATED_BLOCKCMT} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_error("Unterminated comment", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{UNTERMINATED_STRING} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_error("Unterminated string literal", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

{UNTERMINATED_CHAR} {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_error("Unterminated character literal", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

"<<="|">>="|"++"|"--"|"->"|"=="|"!="|"<="|">="|"&&"|"||"|"+="|"-="|"*="|"/="|"%="|"&="|"|="|"^="|"<<"|">>"|"+"|"-"|"*"|"/"|"%"|"="|"<"|">"|"!"|"&"|"|"|"^"|"~"|"?"|":" {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("operator", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

"("|")"|"{"|"}"|"["|"]"|","|";"|"." {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_token("punctuation", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

[ \t\r]+ {
  advance_position(yytext, yyleng);
}

\n {
  advance_position(yytext, yyleng);
}

. {
  int line = START_LINE;
  int column = START_COLUMN;
  emit_error("Invalid token", yytext, yyleng, line, column);
  advance_position(yytext, yyleng);
}

%%

int main(void) {
  yylex();
  return 0;
}
