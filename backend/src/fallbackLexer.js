const KEYWORDS = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long',
  'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct',
  'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', '_Bool',
  '_Complex', '_Imaginary'
]);

const OPERATORS = ['>>=', '<<=', '++', '--', '->', '==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':'];
const PUNCTUATION = new Set(['(', ')', '{', '}', '[', ']', ',', ';', '.']);

function isIdentifierStart(char) {
  return /[A-Za-z_]/.test(char);
}

function isIdentifierPart(char) {
  return /[A-Za-z0-9_]/.test(char);
}

function advancePosition(text, position) {
  let { line, column } = position;
  for (const char of text) {
    if (char === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function pushToken(tokens, type, lexeme, line, column) {
  tokens.push({
    kind: 'token',
    type,
    lexeme,
    line,
    column,
    endColumn: column + lexeme.length
  });
}

function pushError(errors, message, line, column, lexeme) {
  errors.push({
    kind: 'error',
    message,
    line,
    column,
    lexeme
  });
}

export function analyzeWithFallback(source) {
  const tokens = [];
  const errors = [];
  let index = 0;
  let position = { line: 1, column: 1 };

  while (index < source.length) {
    const char = source[index];
    const line = position.line;
    const column = position.column;

    if (char === ' ' || char === '\t' || char === '\r') {
      position = advancePosition(char, position);
      index += 1;
      continue;
    }

    if (char === '\n') {
      position = advancePosition(char, position);
      index += 1;
      continue;
    }

    if (char === '/' && source[index + 1] === '/') {
      let end = index + 2;
      while (end < source.length && source[end] !== '\n') {
        end += 1;
      }
      const lexeme = source.slice(index, end);
      pushToken(tokens, 'comment', lexeme, line, column);
      position = advancePosition(lexeme, position);
      index = end;
      continue;
    }

    if (char === '/' && source[index + 1] === '*') {
      let end = index + 2;
      let terminated = false;
      while (end < source.length) {
        if (source[end] === '*' && source[end + 1] === '/') {
          end += 2;
          terminated = true;
          break;
        }
        end += 1;
      }
      const lexeme = source.slice(index, end);
      if (terminated) {
        pushToken(tokens, 'comment', lexeme, line, column);
      } else {
        pushError(errors, 'Unterminated comment', line, column, lexeme);
      }
      position = advancePosition(lexeme, position);
      index = end;
      continue;
    }

    if (char === '"') {
      let end = index + 1;
      let escaped = false;
      let terminated = false;
      while (end < source.length) {
        const current = source[end];
        if (current === '\n') {
          break;
        }
        if (escaped) {
          escaped = false;
        } else if (current === '\\') {
          escaped = true;
        } else if (current === '"') {
          end += 1;
          terminated = true;
          break;
        }
        end += 1;
      }
      const lexeme = source.slice(index, end);
      if (terminated) {
        pushToken(tokens, 'string', lexeme, line, column);
      } else {
        pushError(errors, 'Unterminated string literal', line, column, lexeme);
      }
      position = advancePosition(lexeme, position);
      index = end;
      continue;
    }

    if (char === '\'') {
      let end = index + 1;
      let escaped = false;
      let terminated = false;
      while (end < source.length) {
        const current = source[end];
        if (current === '\n') {
          break;
        }
        if (escaped) {
          escaped = false;
        } else if (current === '\\') {
          escaped = true;
        } else if (current === '\'') {
          end += 1;
          terminated = true;
          break;
        }
        end += 1;
      }
      const lexeme = source.slice(index, end);
      if (terminated) {
        pushToken(tokens, 'char', lexeme, line, column);
      } else {
        pushError(errors, 'Unterminated character literal', line, column, lexeme);
      }
      position = advancePosition(lexeme, position);
      index = end;
      continue;
    }

    const numberMatch = source.slice(index).match(/^((?:\d+\.\d+|\d+\.)(?:[eE][+-]?\d+)?|\d+(?:[eE][+-]?\d+)?|\d+)/);
    if (numberMatch) {
      const lexeme = numberMatch[0];
      const type = lexeme.includes('.') || /[eE]/.test(lexeme) ? 'float' : 'integer';
      pushToken(tokens, type, lexeme, line, column);
      position = advancePosition(lexeme, position);
      index += lexeme.length;
      continue;
    }

    if (isIdentifierStart(char)) {
      let end = index + 1;
      while (end < source.length && isIdentifierPart(source[end])) {
        end += 1;
      }
      const lexeme = source.slice(index, end);
      pushToken(tokens, KEYWORDS.has(lexeme) ? 'keyword' : 'identifier', lexeme, line, column);
      position = advancePosition(lexeme, position);
      index = end;
      continue;
    }

    const operator = OPERATORS.find((entry) => source.startsWith(entry, index));
    if (operator) {
      pushToken(tokens, 'operator', operator, line, column);
      position = advancePosition(operator, position);
      index += operator.length;
      continue;
    }

    if (PUNCTUATION.has(char)) {
      pushToken(tokens, 'punctuation', char, line, column);
      position = advancePosition(char, position);
      index += 1;
      continue;
    }

    pushError(errors, `Invalid token '${char}'`, line, column, char);
    position = advancePosition(char, position);
    index += 1;
  }

  return { tokens, errors };
}
