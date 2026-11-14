import { LanguageSupport } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { moonscriptLanguage, moonscriptStreamParser } from './moonscript-language';
import { moonscriptCompletionSource } from './completion';
import { moonscriptFoldService } from './folding';
import { moonscriptLinter, moonscriptLintSource } from './linter';

export interface MoonScriptConfig {
  /**
   * Enable autocompletion extension (registered via languageData).
   * @default true
   */
  autocomplete?: boolean;

  /**
   * Enable syntax diagnostic linter.
   * @default false
   */
  linter?: boolean;
}

export {
  moonscriptLanguage,
  moonscriptStreamParser,
  moonscriptCompletionSource,
  moonscriptFoldService,
  moonscriptLinter,
  moonscriptLintSource
};

/**
 * Returns a CodeMirror 6 LanguageSupport extension for MoonScript.
 *
 * @example
 * ```js
 * import { EditorView, basicSetup } from 'codemirror';
 * import { moonscript } from 'codemirror-lang-moonscript';
 *
 * new EditorView({
 *   doc: 'class Thing extends Parent\n  new: (@name) =>\n    @value = 42',
 *   extensions: [basicSetup, moonscript({ linter: true })]
 * });
 * ```
 */
export function moonscript(config: MoonScriptConfig = {}): LanguageSupport {
  const extensions: Extension[] = [moonscriptFoldService];

  if (config.linter) {
    extensions.push(moonscriptLinter);
  }

  return new LanguageSupport(moonscriptLanguage, extensions);
}
