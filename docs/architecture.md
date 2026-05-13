# Architecture

## Overview
The project is split into three main layers:

- `frontend/` contains the React + Tailwind IDE-style interface.
- `backend/` exposes the analysis API and invokes the lexer runner.
- `lexer/` contains the Flex scanner definition that classifies tokens and emits JSON records.

## Data Flow
1. The user edits or uploads C source code in the browser.
2. The frontend sends the code to `POST /api/analyze`.
3. The backend ensures the Flex scanner is available.
4. If Flex and a C compiler are installed, the backend compiles and runs the generated scanner.
5. If the Flex toolchain is unavailable, the backend falls back to a local parser so the demo still works.
6. The frontend renders tokens, errors, statistics, and token highlights.

## Token Contract
Each token record contains:

- `kind`: `token`
- `type`: `keyword`, `identifier`, `integer`, `float`, `string`, `char`, `operator`, `punctuation`, or `comment`
- `lexeme`: original source fragment
- `line`: starting line number
- `column`: starting column number
- `endColumn`: ending column number

Each lexical error contains:

- `kind`: `error`
- `message`: human-readable error text
- `lexeme`: offending input fragment
- `line`: error line
- `column`: error column

## Notes
The UI is intentionally dark and dense, similar to a modern online compiler. The Monaco editor uses the lexical output to render token highlights directly inside the code view.
