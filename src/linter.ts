import { linter, Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';

/**
 * Diagnostic linter source function for MoonScript syntax checking.
 */
export function moonscriptLintSource(view: EditorView): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc;
  let hasTabs = false;
  let hasSpaces = false;

  const stack: { char: string; pos: number; line: number }[] = [];
  const pairMap: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const text = line.text;

    // 1. Detect mixed tab & space indentation
    const indentMatch = text.match(/^[\t ]+/);
    if (indentMatch) {
      if (indentMatch[0].includes('\t')) hasTabs = true;
      if (indentMatch[0].includes(' ')) hasSpaces = true;
    }

    // 2. Unclosed string detection
    if (!text.includes('[[') && !text.includes(']]') && !text.trim().startsWith('--')) {
      let inDouble = false;
      let inSingle = false;
      let doubleStart = -1;
      let singleStart = -1;

      for (let chIdx = 0; chIdx < text.length; chIdx++) {
        const char = text[chIdx];
        const prev = chIdx > 0 ? text[chIdx - 1] : '';

        if (char === '"' && !inSingle && prev !== '\\') {
          inDouble = !inDouble;
          if (inDouble) doubleStart = line.from + chIdx;
        } else if (char === "'" && !inDouble && prev !== '\\') {
          inSingle = !inSingle;
          if (inSingle) singleStart = line.from + chIdx;
        }
      }

      if (inDouble) {
        diagnostics.push({
          from: doubleStart,
          to: line.to,
          severity: 'error',
          message: 'Unclosed double-quoted string literal'
        });
      }
      if (inSingle) {
        diagnostics.push({
          from: singleStart,
          to: line.to,
          severity: 'error',
          message: 'Unclosed single-quoted string literal'
        });
      }
    }

    // 3. Bracket / Paren / Brace Mismatch Tracking
    if (!text.trim().startsWith('--')) {
      for (let chIdx = 0; chIdx < text.length; chIdx++) {
        const char = text[chIdx];
        const pos = line.from + chIdx;

        if (char === '(' || char === '[' || char === '{') {
          stack.push({ char, pos, line: i });
        } else if (char === ')' || char === ']' || char === '}') {
          const expected = pairMap[char];
          if (stack.length === 0 || stack[stack.length - 1].char !== expected) {
            diagnostics.push({
              from: pos,
              to: pos + 1,
              severity: 'error',
              message: `Unmatched closing bracket '${char}'`
            });
          } else {
            stack.pop();
          }
        }
      }
    }
  }

  // 4. Report unclosed opening brackets
  for (const unclosed of stack) {
    diagnostics.push({
      from: unclosed.pos,
      to: unclosed.pos + 1,
      severity: 'error',
      message: `Unclosed opening bracket '${unclosed.char}'`
    });
  }

  // 5. Warning for mixed tabs and spaces
  if (hasTabs && hasSpaces) {
    diagnostics.push({
      from: 0,
      to: doc.length > 0 ? 1 : 0,
      severity: 'warning',
      message: 'Inconsistent indentation: document contains a mix of tabs and spaces'
    });
  }

  return diagnostics;
}

/**
 * CodeMirror 6 Linter Extension for MoonScript
 */
export const moonscriptLinter = linter(moonscriptLintSource);
