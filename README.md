# codemirror-lang-moonscript

> Full, feature-rich MoonScript language support plugin for [CodeMirror 6](https://codemirror.net/).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CodeMirror 6](https://img.shields.io/badge/CodeMirror-6.x-purple.svg)](https://codemirror.net/)

## Features

- 🎨 **Lexical Syntax Highlighting**: Full grammar support for MoonScript & Lua keywords, multiline comments (`--[[ ... ]]`), multiline strings (`[[ ... ]]`), backtick command execution (``` `...` ```), hex/scientific numbers, instance variables (`@field`, `@@class`), shorthand keys (`:key`), and function arrows (`->`, `=>`).
- ⚡ **Smart Autocompletion**: Integrated completion provider for keywords, standard library namespaces (`math.`, `string.`, `table.`, `io.`, `os.`, `coroutine.`), snippet completions (`class`, `switch`, `for in *`, `with`, `->`), and document variables.
- 📐 **Indentation & Block Folding**: Custom indentation-based `foldService` for collapsing class definitions, functions, multiline tables, and comments.
- 🔍 **Syntax Diagnostic Linter**: Built-in linter checking for unclosed strings, bracket/brace mismatches (`()`, `[]`, `{}`), and mixed tab/space indentation.
- 💬 **Comment Toggling**: Configured `commentTokens` for line (`--`) and block (`--[[` / `]]`) toggling via editor shortcuts.
- 🔒 **Auto-Closing Brackets**: Language data configuration for auto-closing quotes and brackets.

---

## Installation

```bash
npm install codemirror-lang-moonscript @codemirror/language @codemirror/state @codemirror/view
```

---

## Quick Usage

```javascript
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { moonscript } from 'codemirror-lang-moonscript';

const state = EditorState.create({
  doc: `class Thing extends Parent
  new: (@name) =>
    @value = 42

  greet: ->
    print "Hello " .. @name`,
  extensions: [
    basicSetup,
    moonscript({ linter: true })
  ]
});

new EditorView({
  state,
  parent: document.getElementById('editor')
});
```

---

## Configuration Options

The `moonscript(config?: MoonScriptConfig)` extension factory accepts an optional configuration object:

```typescript
interface MoonScriptConfig {
  /**
   * Enable autocompletion extension provider.
   * Registered via languageData.autocomplete.
   * @default true
   */
  autocomplete?: boolean;

  /**
   * Enable real-time syntax diagnostic linter.
   * @default false
   */
  linter?: boolean;
}
```

---

## API Exports

The package exports the following symbols:

- `moonscript(config?: MoonScriptConfig)`: Returns the primary `LanguageSupport` extension.
- `moonscriptLanguage`: The CodeMirror 6 `StreamLanguage` instance with attached `languageData`.
- `moonscriptStreamParser`: The underlying raw `StreamParser` specification.
- `moonscriptCompletionSource`: Autocompletion provider function for `@codemirror/autocomplete`.
- `moonscriptFoldService`: Indentation & block code folding service extension.
- `moonscriptLinter`: Real-time diagnostic linter extension for `@codemirror/lint`.
- `moonscriptLintSource`: Raw diagnostic source function `(view: EditorView) => Diagnostic[]`.

---

## Interactive Playground Showcase

Launch the local dev server to try the interactive studio demo:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## License

[MIT](LICENSE)
