import { StreamLanguage, StreamParser } from '@codemirror/language';
import { moonscriptCompletionSource } from './completion';
import {
  moonscriptKeywords,
  moonscriptAtoms,
  moonscriptBuiltins,
  moonscriptStandardModules
} from './constants';

export interface MoonScriptParserState {
  inBlockComment: boolean;
  blockCommentClose: string;
  inLongString: boolean;
  longStringClose: string;
}

export {
  moonscriptKeywords,
  moonscriptAtoms,
  moonscriptBuiltins,
  moonscriptStandardModules
};

/**
 * Enhanced StreamParser for MoonScript lexical highlighting rules.
 */
export const moonscriptStreamParser: StreamParser<MoonScriptParserState> = {
  name: 'moonscript',
  languageData: {
    commentTokens: { line: '--', block: { open: '--[[', close: ']]' } },
    closeBrackets: { brackets: ['(', '[', '{', '"', "'", '`'] },
    indentOnInput: /^\s*(else|elseif|when)\b/,
    autocomplete: moonscriptCompletionSource
  },

  startState(): MoonScriptParserState {
    return {
      inBlockComment: false,
      blockCommentClose: ']]',
      inLongString: false,
      longStringClose: ']]'
    };
  },

  copyState(state: MoonScriptParserState): MoonScriptParserState {
    return { ...state };
  },

  token(stream, state) {
    // 1. Handle active multiline block comment
    if (state.inBlockComment) {
      if (stream.skipTo(state.blockCommentClose)) {
        stream.match(state.blockCommentClose);
        state.inBlockComment = false;
      } else {
        stream.skipToEnd();
      }
      return 'comment';
    }

    // 2. Handle active multiline long string
    if (state.inLongString) {
      if (stream.skipTo(state.longStringClose)) {
        stream.match(state.longStringClose);
        state.inLongString = false;
      } else {
        stream.skipToEnd();
      }
      return 'string';
    }

    // 3. Whitespace
    if (stream.eatSpace()) return null;

    // 4. Block comments --[[ ... ]] or --[=[ ... ]=]
    if (stream.match(/--\[=*\[/)) {
      const match = stream.current();
      const equalsCount = match.length - 4;
      state.inBlockComment = true;
      state.blockCommentClose = ']' + '='.repeat(equalsCount) + ']';
      if (stream.skipTo(state.blockCommentClose)) {
        stream.match(state.blockCommentClose);
        state.inBlockComment = false;
      } else {
        stream.skipToEnd();
      }
      return 'comment';
    }

    // 5. Line comments (-- comment)
    if (stream.match('--')) {
      stream.skipToEnd();
      return 'comment';
    }

    // 6. Long strings [[ ... ]] or [=[ ... ]=]
    if (stream.match(/\[=*\[/)) {
      const match = stream.current();
      const equalsCount = match.length - 2;
      state.inLongString = true;
      state.longStringClose = ']' + '='.repeat(equalsCount) + ']';
      if (stream.skipTo(state.longStringClose)) {
        stream.match(state.longStringClose);
        state.inLongString = false;
      } else {
        stream.skipToEnd();
      }
      return 'string';
    }

    // 7. Backtick exec command strings `...`
    if (stream.match(/`([^`\\]|\\.)*`/)) {
      return 'string.special';
    }

    // 8. Quoted strings "..." and '...'
    if (stream.match(/"(?:[^\\]|\\.)*"/)) return 'string';
    if (stream.match(/'(?:[^\\]|\\.)*'/)) return 'string';

    // 9. Hexadecimal and scientific numbers
    if (stream.match(/0x[0-9a-fA-F]+(\.[0-9a-fA-F]+)?([pP][-+]?\d+)?/)) return 'number';
    if (stream.match(/\b\d+(\.\d+)?([eE][-+]?\d+)?\b/)) return 'number';

    // 10. Instance and Class Variables (@field, @@class_field, @ alone)
    if (stream.match(/@@[a-zA-Z_]\w*/)) return 'variableName.special';
    if (stream.match(/@[a-zA-Z_]\w*/)) return 'variableName.special';
    if (stream.match(/@/)) return 'variableName.special';

    // 11. Function arrows -> and =>
    if (stream.match(/->|=>/)) return 'punctuation';

    // 12. Shorthand table keys (:key) and key definitions (key:)
    if (stream.match(/:[a-zA-Z_]\w*/)) return 'propertyName';
    if (stream.match(/[a-zA-Z_]\w*:/)) return 'propertyName';

    // 13. Operators
    if (stream.match(/\.\.=?|[-+*/%^#=<>&|~!:]+/)) return 'operator';

    // 14. Brackets and Punctuation
    if (stream.match(/[()[\]{},;]/)) return 'punctuation';

    // 15. Identifiers, Keywords, Atoms, Builtins, Modules
    if (stream.match(/[a-zA-Z_]\w*/)) {
      const word = stream.current();
      if (moonscriptKeywords.has(word)) return 'keyword';
      if (moonscriptAtoms.has(word)) return 'atom';
      if (moonscriptBuiltins.has(word)) return 'builtin';
      if (moonscriptStandardModules.has(word)) return 'namespace';
      return 'variableName';
    }

    // Advance 1 char if no rule matched
    stream.next();
    return null;
  }
};

/**
 * CodeMirror 6 StreamLanguage instance for MoonScript with language configuration
 */
export const moonscriptLanguage = StreamLanguage.define(moonscriptStreamParser);
