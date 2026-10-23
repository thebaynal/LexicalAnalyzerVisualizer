# Lexical Analyzer Visualizer

A modern compiler-design web application that demonstrates lexical analysis for a C language subset using a Flex-powered lexer and a polished React + Tailwind dashboard.

## Features

- IDE-style dark interface inspired by VS Code and online compilers.
- Monaco editor with token highlighting, drag-and-drop file upload, and sample source loading.
- Flex lexer that classifies keywords, identifiers, literals, operators, punctuation, comments, and lexical errors.
- Statistics cards, token table, error console, and charts.
- TXT and JSON report downloads.
- Theme toggle, animated panels, and responsive layout.

## Project Structure

```plaintext
/frontend
/backend
/lexer
/docs
/examples
```

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Monaco Editor, Framer Motion, Recharts
- Backend: Node.js, Express
- Lexer: Flex

## Setup

Install dependencies at the repository root and in both workspaces:

```bash
npm install
npm install --workspace frontend
npm install --workspace backend
```

Run the backend on port `4000`:

```bash
npm run dev:backend
```

Run the frontend on port `5173`:

```bash
npm run dev:frontend
```

## Flex Toolchain

The backend will use the generated Flex scanner when these tools are available:

- `flex`
- `gcc` or `clang`

If the toolchain is missing, the backend falls back to a local parser so the demo remains usable.

## API

- `GET /api/health` returns runtime and lexer status.
- `GET /api/examples` returns sample C snippets.
- `POST /api/analyze` accepts `{ "code": "..." }` and returns tokens, errors, and statistics.

## Example Source Files

See the `examples/` folder for standalone C snippets that you can upload into the editor.

## Notes

The Flex lexer lives in `lexer/lexical_analyzer.l`. The backend compiles it to a local cache directory when possible and executes the scanner to produce structured token output.

## Methodology

A user types or uploads a C-subset program into the Monaco editor. The React client sends it to `POST /api/analyze`. The Express backend compiles and invokes the Flex scanner when Flex and a C compiler are installed; otherwise it uses the JavaScript fallback lexer. The resulting token records include type, lexeme, line, column, and ending column. Error records include the offending text and its source location. The dashboard uses those records to highlight code, populate the token table, show lexical errors, and calculate token statistics. See [the architecture notes](docs/architecture.md).

## Results and limitations

The implementation produces structured token and error output, an interactive token table, statistical charts, and downloadable TXT/JSON reports. Included C examples cover basic declarations, control flow, comments, and errors. This is a teaching tool for lexical analysis of a C subset: it does not perform full C parsing, type checking, code generation, or execution. The fallback is a separate implementation and should not be assumed identical to Flex on every input. No published tokenization-accuracy benchmark or measured performance result is included.
