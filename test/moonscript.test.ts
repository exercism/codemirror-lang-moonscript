import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EditorState } from '@codemirror/state';
import { CompletionContext } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import {
  moonscript,
  moonscriptLanguage,
  moonscriptStreamParser,
  moonscriptCompletionSource,
  moonscriptLintSource,
  moonscriptFoldService
} from '../src/index';

describe('MoonScript Language Support Plugin', () => {
  describe('Plugin Extension Factory', () => {
    it('creates a LanguageSupport instance', () => {
      const support = moonscript();
      assert.ok(support);
      assert.equal(support.language, moonscriptLanguage);
    });

    it('instantiates with linter configuration enabled', () => {
      const support = moonscript({ linter: true });
      assert.ok(support);
      assert.ok(support.support);
    });
  });

  describe('StreamParser Tokenization', () => {
    function tokenizeLine(code: string) {
      const state = moonscriptStreamParser.startState!(1);
      const tokens: { text: string; style: string | null }[] = [];
      let cursor = 0;

      while (cursor < code.length) {
        const stream = {
          string: code,
          pos: cursor,
          start: cursor,
          current: () => code.slice(stream.start, stream.pos),
          eatSpace: () => {
            const match = /^\s+/.exec(code.slice(stream.pos));
            if (match) {
              stream.pos += match[0].length;
              return true;
            }
            return false;
          },
          match: (pattern: RegExp | string) => {
            if (typeof pattern === 'string') {
              if (code.slice(stream.pos).startsWith(pattern)) {
                stream.pos += pattern.length;
                return true;
              }
              return false;
            }
            const match = pattern.exec(code.slice(stream.pos));
            if (match && match.index === 0) {
              stream.pos += match[0].length;
              return true;
            }
            return false;
          },
          skipToEnd: () => {
            stream.pos = code.length;
          },
          skipTo: (ch: string) => {
            const idx = code.indexOf(ch, stream.pos);
            if (idx !== -1) {
              stream.pos = idx;
              return true;
            }
            return false;
          },
          next: () => {
            if (stream.pos < code.length) {
              return code[stream.pos++];
            }
            return undefined;
          }
        };

        const style = moonscriptStreamParser.token(stream as any, state);
        const text = code.slice(cursor, stream.pos);
        if (text) {
          tokens.push({ text, style });
        }
        cursor = stream.pos;
      }
      return tokens;
    }

    it('tokenizes comments correctly', () => {
      const tokens = tokenizeLine('-- single line comment');
      assert.equal(tokens[0].style, 'comment');
    });

    it('tokenizes strings (single, double, and backtick exec)', () => {
      assert.equal(tokenizeLine('"hello world"')[0].style, 'string');
      assert.equal(tokenizeLine("'hello world'")[0].style, 'string');
      assert.equal(tokenizeLine('`echo test`')[0].style, 'string.special');
    });

    it('tokenizes numbers (hex, float, integer)', () => {
      assert.equal(tokenizeLine('0xFF')[0].style, 'number');
      assert.equal(tokenizeLine('3.14159')[0].style, 'number');
      assert.equal(tokenizeLine('100')[0].style, 'number');
    });

    it('tokenizes instance and class variables', () => {
      assert.equal(tokenizeLine('@name')[0].style, 'variableName.special');
      assert.equal(tokenizeLine('@@count')[0].style, 'variableName.special');
    });

    it('tokenizes keywords, builtins, and modules', () => {
      assert.equal(tokenizeLine('class')[0].style, 'keyword');
      assert.equal(tokenizeLine('extends')[0].style, 'keyword');
      assert.equal(tokenizeLine('switch')[0].style, 'keyword');
      assert.equal(tokenizeLine('print')[0].style, 'builtin');
      assert.equal(tokenizeLine('math')[0].style, 'namespace');
    });

    it('tokenizes function arrows and operators', () => {
      assert.equal(tokenizeLine('->')[0].style, 'punctuation');
      assert.equal(tokenizeLine('=>')[0].style, 'punctuation');
      assert.equal(tokenizeLine('==')[0].style, 'operator');
    });
  });

  describe('Autocompletion Provider', () => {
    it('provides completion options for words', () => {
      const state = EditorState.create({
        doc: 'cl',
        extensions: [moonscriptLanguage]
      });

      const context = new CompletionContext(state, 2, false);
      const res = moonscriptCompletionSource(context);

      assert.ok(res);
      assert.ok(res.options.some((opt) => opt.label === 'class'));
    });

    it('provides dot completion for standard module methods', () => {
      const state = EditorState.create({
        doc: 'math.',
        extensions: [moonscriptLanguage]
      });

      const context = new CompletionContext(state, 5, true);
      const res = moonscriptCompletionSource(context);

      assert.ok(res);
      assert.ok(res.options.some((opt) => opt.label === 'floor'));
      assert.ok(res.options.some((opt) => opt.label === 'ceil'));
    });

    it('provides instance completions for @ prefix', () => {
      const state = EditorState.create({
        doc: '@',
        extensions: [moonscriptLanguage]
      });

      const context = new CompletionContext(state, 1, true);
      const res = moonscriptCompletionSource(context);

      assert.ok(res);
      assert.ok(res.options.some((opt) => opt.label === '@'));
      assert.ok(res.options.some((opt) => opt.label === '@@'));
    });
  });

  describe('Syntax Diagnostics Linter', () => {
    it('detects unclosed quotes and unmatched brackets', () => {
      const state = EditorState.create({
        doc: 'x = "unclosed quote\nfn(1, 2',
        extensions: [moonscript()]
      });

      const view = new EditorView({ state });
      const diagnostics = moonscriptLintSource(view);

      assert.ok(diagnostics.length > 0);
      assert.ok(diagnostics.some((d) => d.message.includes('Unclosed double-quoted')));
      assert.ok(diagnostics.some((d) => d.message.includes('Unclosed opening bracket')));
    });
  });
});
