import { parser } from "./syntax.grammar";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

export const moonscriptLanguage = LRLanguage.define({
  name: "moonscript",
  parser: parser.configure({
    props: [
      styleTags({
        LineComment: t.lineComment,
        IntegerLiteral: t.number,
        FloatingLiteral: t.float,
        BooleanLiteral: t.bool,
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "//" },
  },
});

export function moonscript() {
  return new LanguageSupport(moonscriptLanguage);
}
