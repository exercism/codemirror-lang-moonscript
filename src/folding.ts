import { foldService } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

/**
 * Custom fold service for MoonScript indentation blocks, block comments, and multiline strings.
 */
export const moonscriptFoldService = foldService.of((state: EditorState, lineStart: number, lineEnd: number) => {
  const line = state.doc.lineAt(lineStart);
  const text = line.text;

  // 1. Multiline Block Comment Fold (--[[ ... ]])
  if (text.includes('--[[')) {
    for (let i = line.number + 1; i <= state.doc.lines; i++) {
      const targetLine = state.doc.line(i);
      if (targetLine.text.includes(']]')) {
        return { from: line.to, to: targetLine.to };
      }
    }
  }

  // 2. Multiline String Fold ([[ ... ]])
  if (text.includes('[[')) {
    for (let i = line.number + 1; i <= state.doc.lines; i++) {
      const targetLine = state.doc.line(i);
      if (targetLine.text.includes(']]')) {
        return { from: line.to, to: targetLine.to };
      }
    }
  }

  // 3. Indentation-based Block Folding
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith('--')) return null;

  const currentIndent = text.search(/\S/);
  if (currentIndent === -1) return null;

  const isBlockStarter =
    /^(class|switch|when|if|else|elseif|unless|while|for|with|do|import)\b/i.test(trimmed) ||
    /->\s*$|=>\s*$/.test(trimmed) ||
    /:\s*$/.test(trimmed) ||
    /\{\s*$/.test(trimmed);

  if (!isBlockStarter) return null;

  let foldEnd = line.to;
  let hasChildLines = false;

  for (let i = line.number + 1; i <= state.doc.lines; i++) {
    const nextLine = state.doc.line(i);
    const nextTrimmed = nextLine.text.trim();

    // Empty lines inside a block do not terminate the fold
    if (!nextTrimmed) continue;

    const nextIndent = nextLine.text.search(/\S/);
    if (nextIndent > currentIndent) {
      foldEnd = nextLine.to;
      hasChildLines = true;
    } else {
      break;
    }
  }

  if (hasChildLines && foldEnd > line.to) {
    return { from: line.to, to: foldEnd };
  }

  return null;
});
