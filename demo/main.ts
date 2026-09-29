import { EditorState, Extension } from '@codemirror/state';
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  keymap
} from '@codemirror/view';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import {
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldGutter,
  foldKeymap
} from '@codemirror/language';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { moonscript, moonscriptLintSource } from '../src/index';

const presets: Record<string, string> = {
  oop: `-- MoonScript Object Oriented Class Example
class Parent
  new: (@name) =>
    @created_at = os.time!

  describe: =>
    print "Parent object: " .. @name

class Child extends Parent
  new: (name, @age=10) =>
    super name

  describe: =>
    super!
    print "Age is: " .. tostring(@age)

-- Instance creation
person = Child "Alice", 12
person\\describe!
`,

  switch: `-- MoonScript Pattern Matching & Table Key Syntax
my_handler = (request) ->
  switch request.status
    when 200, 201
      print "Success response!"
      return { success: true, code: request.status }
    when 404
      print "Not found"
      return { error: "Missing resource" }
    else
      print "Unknown status"
      return nil

-- Table shorthand keys
config = {
  port: 8080
  host: "localhost"
  ssl: false
}
`,

  loops: `-- MoonScript Loops, Comprehensions & With Blocks
numbers = [1, 2, 3, 4, 5, 6]

-- List comprehension with filtering
evens = [x * 2 for x in *numbers when x % 2 == 0]

-- With expression block mutation
user = with { name: "Bob", role: "guest" }
  .role = "admin"
  .updated = true

for item in *evens
  print "Event item: " .. tostring(item)
`,

  async: `-- Coroutines and Standard Math Module
worker = coroutine.create (limit) ->
  for i = 1, limit
    coroutine.yield i * math.pi

status, val = coroutine.resume worker, 3
print "Yielded value: " .. tostring(val)
print "Rounded: " .. tostring(math.floor(val))
`,

  error: `-- Syntax Error Demonstration
-- Notice the diagnostic warnings below:
unclosed_string = "Hello MoonScript without matching quote
unmatched_paren = fn(10, 20
`
};

let currentView: EditorView | null = null;

function createEditorExtensions(): Extension[] {
  const linterChecked = (document.getElementById('toggle-linter') as HTMLInputElement)?.checked ?? true;
  const autocompleteChecked = (document.getElementById('toggle-autocomplete') as HTMLInputElement)?.checked ?? true;
  const foldChecked = (document.getElementById('toggle-fold') as HTMLInputElement)?.checked ?? true;
  const lineNumbersChecked = (document.getElementById('toggle-linenumbers') as HTMLInputElement)?.checked ?? true;

  const exts: Extension[] = [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap
    ])
  ];

  if (lineNumbersChecked) {
    exts.push(lineNumbers());
  }

  if (foldChecked) {
    exts.push(foldGutter());
  }

  if (autocompleteChecked) {
    exts.push(autocompletion());
  }

  exts.push(moonscript({ linter: linterChecked }));

  // Add listener for cursor position and diagnostic updates
  exts.push(
    EditorView.updateListener.of((update) => {
      if (update.selectionSet || update.docChanged) {
        updateCursorPos(update.view);
        if (linterChecked) {
          updateDiagnosticsDisplay(update.view);
        }
      }
    })
  );

  return exts;
}

function updateCursorPos(view: EditorView) {
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);
  const col = pos - line.from + 1;
  const el = document.getElementById('cursor-pos');
  if (el) {
    el.textContent = `Line ${line.number}, Column ${col}`;
  }
}

function updateDiagnosticsDisplay(view: EditorView) {
  const diagnostics = moonscriptLintSource(view);
  const container = document.getElementById('diagnostics-log');
  const countBadge = document.getElementById('diagnostic-count');

  if (!container || !countBadge) return;

  countBadge.textContent = `${diagnostics.length} issues`;
  if (diagnostics.length > 0) {
    countBadge.className = 'badge badge-danger';
    container.innerHTML = diagnostics
      .map(
        (d: { severity: string; message: string }) => `
      <div class="diagnostic-item ${d.severity}">
        <span>●</span>
        <span>${d.message}</span>
      </div>`
      )
      .join('');
  } else {
    countBadge.className = 'badge badge-neutral';
    container.innerHTML = '<p class="console-placeholder">No syntax errors detected. Cleanly parsed MoonScript.</p>';
  }
}

function reinitEditor(docText: string) {
  const container = document.getElementById('editor-container');
  if (!container) return;

  if (currentView) {
    currentView.destroy();
  }

  currentView = new EditorView({
    state: EditorState.create({
      doc: docText,
      extensions: createEditorExtensions()
    }),
    parent: container
  });

  updateCursorPos(currentView);
  updateDiagnosticsDisplay(currentView);
}

function init() {
  reinitEditor(presets.oop);

  // Preset Buttons
  const presetKeys = ['oop', 'switch', 'loops', 'async', 'error'];
  presetKeys.forEach((key) => {
    const btn = document.getElementById(`preset-${key}`);
    if (btn) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-preset').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        reinitEditor(presets[key]);
      });
    }
  });

  // Toggle Switches
  ['toggle-linter', 'toggle-autocomplete', 'toggle-fold', 'toggle-linenumbers'].forEach((id) => {
    const toggle = document.getElementById(id);
    if (toggle) {
      toggle.addEventListener('change', () => {
        if (currentView) {
          const doc = currentView.state.doc.toString();
          reinitEditor(doc);
        }
      });
    }
  });

  // Action Buttons
  const btnClear = document.getElementById('btn-clear');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      reinitEditor('');
    });
  }

  const btnFormat = document.getElementById('btn-format');
  if (btnFormat) {
    btnFormat.addEventListener('click', () => {
      if (currentView) {
        const text = currentView.state.doc.toString();
        reinitEditor(text);
      }
    });
  }
}

// Immediate execution fallback for Vite module loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
