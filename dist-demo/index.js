import { StreamLanguage as x, foldService as v, LanguageSupport as A } from "@codemirror/language";
import { snippetCompletion as u } from "@codemirror/autocomplete";
import { linter as L } from "@codemirror/lint";
const T = Array.from(g).map((e) => ({
  label: e,
  type: "keyword",
  boost: 1
})), B = Array.from(C).map((e) => ({
  label: e,
  type: "atom",
  boost: 2
})), _ = Array.from(y).map((e) => ({
  label: e,
  type: "function",
  detail: "Lua/MoonScript builtin",
  boost: 2
})), N = Array.from(w).map((e) => ({
  label: e,
  type: "namespace",
  detail: "Standard module",
  boost: 3
})), z = [
  u("class ${ClassName}\n  new: (@${param}) =>\n    ${cursor}", {
    label: "class",
    detail: "MoonScript class definition",
    type: "snippet",
    boost: 5
  }),
  u("class ${ClassName} extends ${Parent}\n  new: (@${param}) =>\n    super!\n    ${cursor}", {
    label: "class extends",
    detail: "Class inheritance definition",
    type: "snippet",
    boost: 5
  }),
  u("(${args}) ->\n  ${cursor}", {
    label: "fn ->",
    detail: "Anonymous function",
    type: "snippet",
    boost: 4
  }),
  u("(${args}) =>\n  ${cursor}", {
    label: "fn =>",
    detail: "Bound function (self)",
    type: "snippet",
    boost: 4
  }),
  u(`switch \${expr}
  when \${val1}
    \${cursor}
  else
    `, {
    label: "switch",
    detail: "Switch/when pattern match",
    type: "snippet",
    boost: 4
  }),
  u("with ${object}\n  .${property} = ${value}\n  ${cursor}", {
    label: "with",
    detail: "With expression block",
    type: "snippet",
    boost: 4
  }),
  u("for ${item} in *${list}\n  ${cursor}", {
    label: "for in *",
    detail: "List iteration loop",
    type: "snippet",
    boost: 4
  }),
  u("for ${k}, ${v} in pairs ${tbl}\n  ${cursor}", {
    label: "for in pairs",
    detail: "Table key-value iteration",
    type: "snippet",
    boost: 4
  }),
  u("import ${name} from ${module}", {
    label: "import from",
    detail: "MoonScript import",
    type: "snippet",
    boost: 4
  })
], $ = {
  math: [
    "abs",
    "acos",
    "asin",
    "atan",
    "ceil",
    "cos",
    "deg",
    "exp",
    "floor",
    "fmod",
    "log",
    "max",
    "min",
    "modf",
    "pow",
    "rad",
    "random",
    "randomseed",
    "sin",
    "sqrt",
    "tan",
    "pi",
    "huge"
  ].map((e) => ({ label: e, type: "function", detail: "math library" })),
  string: [
    "byte",
    "char",
    "dump",
    "find",
    "format",
    "gmatch",
    "gsub",
    "len",
    "lower",
    "match",
    "rep",
    "reverse",
    "sub",
    "upper"
  ].map((e) => ({ label: e, type: "function", detail: "string library" })),
  table: [
    "concat",
    "insert",
    "move",
    "pack",
    "remove",
    "sort",
    "unpack"
  ].map((e) => ({ label: e, type: "function", detail: "table library" })),
  io: [
    "close",
    "flush",
    "input",
    "lines",
    "open",
    "output",
    "popen",
    "read",
    "tmpfile",
    "type",
    "write"
  ].map((e) => ({ label: e, type: "function", detail: "io library" })),
  os: [
    "clock",
    "date",
    "difftime",
    "execute",
    "exit",
    "getenv",
    "remove",
    "rename",
    "setlocale",
    "time",
    "tmpname"
  ].map((e) => ({ label: e, type: "function", detail: "os library" })),
  coroutine: [
    "create",
    "resume",
    "running",
    "status",
    "wrap",
    "yield",
    "isyieldable"
  ].map((e) => ({ label: e, type: "function", detail: "coroutine library" }))
};
function E(e) {
  const t = e.matchBefore(/([a-zA-Z_]\w*)\.\w*$/);
  if (t) {
    const n = t.text.split(".")[0];
    if ($[n])
      return {
        from: t.from + n.length + 1,
        options: $[n],
        validFor: /^\w*$/
      };
  }
  const a = e.matchBefore(/@@?\w*$/);
  if (a)
    return {
      from: a.from,
      options: [
        { label: "@", type: "property", detail: "self" },
        { label: "@@", type: "property", detail: "class" }
      ],
      validFor: /^@@?\w*$/
    };
  const o = e.matchBefore(/[a-zA-Z_]\w*$/);
  if (!o && !e.explicit) return null;
  const m = o ? o.from : e.pos, l = e.state.doc.toString(), f = /* @__PURE__ */ new Set(), p = /\b[a-zA-Z_]\w*\b/g;
  let c;
  for (; (c = p.exec(l)) !== null; ) {
    const n = c[0];
    !g.has(n) && !y.has(n) && !w.has(n) && f.add(n);
  }
  const s = Array.from(f).map((n) => ({
    label: n,
    type: "variable",
    detail: "Local variable"
  })), i = [
    ...z,
    ...T,
    ...B,
    ..._,
    ...N,
    ...s
  ];
  return {
    from: m,
    options: i,
    validFor: /^[a-zA-Z_]\w*$/
  };
}
const g = /* @__PURE__ */ new Set([
  "class",
  "extends",
  "super",
  "import",
  "export",
  "from",
  "with",
  "using",
  "switch",
  "when",
  "if",
  "else",
  "elseif",
  "unless",
  "while",
  "for",
  "in",
  "do",
  "return",
  "break",
  "continue",
  "local",
  "is",
  "isnt",
  "and",
  "or",
  "not",
  "then"
]), C = /* @__PURE__ */ new Set([
  "true",
  "false",
  "nil",
  "self"
]), y = /* @__PURE__ */ new Set([
  "print",
  "type",
  "tostring",
  "tonumber",
  "setmetatable",
  "getmetatable",
  "pairs",
  "ipairs",
  "next",
  "assert",
  "error",
  "pcall",
  "xpcall",
  "select",
  "rawget",
  "rawset",
  "rawequal",
  "collectgarbage",
  "load",
  "loadfile",
  "dofile",
  "require",
  "unpack",
  "_G",
  "_VERSION"
]), w = /* @__PURE__ */ new Set([
  "math",
  "string",
  "table",
  "io",
  "os",
  "coroutine",
  "package",
  "debug"
]), M = {
  name: "moonscript",
  languageData: {
    commentTokens: { line: "--", block: { open: "--[[", close: "]]" } },
    closeBrackets: { brackets: ["(", "[", "{", '"', "'", "`"] },
    indentOnInput: /^\s*(else|elseif|when)\b/,
    autocomplete: E
  },
  startState() {
    return {
      inBlockComment: !1,
      blockCommentClose: "]]",
      inLongString: !1,
      longStringClose: "]]"
    };
  },
  copyState(e) {
    return { ...e };
  },
  token(e, t) {
    if (t.inBlockComment)
      return e.skipTo(t.blockCommentClose) ? (e.match(t.blockCommentClose), t.inBlockComment = !1) : e.skipToEnd(), "comment";
    if (t.inLongString)
      return e.skipTo(t.longStringClose) ? (e.match(t.longStringClose), t.inLongString = !1) : e.skipToEnd(), "string";
    if (e.eatSpace()) return null;
    if (e.match(/--\[=*\[/)) {
      const o = e.current().length - 4;
      return t.inBlockComment = !0, t.blockCommentClose = "]" + "=".repeat(o) + "]", e.skipTo(t.blockCommentClose) ? (e.match(t.blockCommentClose), t.inBlockComment = !1) : e.skipToEnd(), "comment";
    }
    if (e.match("--"))
      return e.skipToEnd(), "comment";
    if (e.match(/\[=*\[/)) {
      const o = e.current().length - 2;
      return t.inLongString = !0, t.longStringClose = "]" + "=".repeat(o) + "]", e.skipTo(t.longStringClose) ? (e.match(t.longStringClose), t.inLongString = !1) : e.skipToEnd(), "string";
    }
    if (e.match(/`([^`\\]|\\.)*`/))
      return "string.special";
    if (e.match(/"(?:[^\\]|\\.)*"/) || e.match(/'(?:[^\\]|\\.)*'/)) return "string";
    if (e.match(/0x[0-9a-fA-F]+(\.[0-9a-fA-F]+)?([pP][-+]?\d+)?/) || e.match(/\b\d+(\.\d+)?([eE][-+]?\d+)?\b/)) return "number";
    if (e.match(/@@[a-zA-Z_]\w*/) || e.match(/@[a-zA-Z_]\w*/) || e.match(/@/)) return "variableName.special";
    if (e.match(/->|=>/)) return "punctuation";
    if (e.match(/:[a-zA-Z_]\w*/) || e.match(/[a-zA-Z_]\w*:/)) return "propertyName";
    if (e.match(/\.\.=?|[-+*/%^#=<>&|~!:]+/)) return "operator";
    if (e.match(/[()[\]{},;]/)) return "punctuation";
    if (e.match(/[a-zA-Z_]\w*/)) {
      const a = e.current();
      return g.has(a) ? "keyword" : C.has(a) ? "atom" : y.has(a) ? "builtin" : w.has(a) ? "namespace" : "variableName";
    }
    return e.next(), null;
  }
}, Z = x.define(M), I = v.of((e, t, a) => {
  const o = e.doc.lineAt(t), m = o.text;
  if (m.includes("--[["))
    for (let i = o.number + 1; i <= e.doc.lines; i++) {
      const n = e.doc.line(i);
      if (n.text.includes("]]"))
        return { from: o.to, to: n.to };
    }
  if (m.includes("[["))
    for (let i = o.number + 1; i <= e.doc.lines; i++) {
      const n = e.doc.line(i);
      if (n.text.includes("]]"))
        return { from: o.to, to: n.to };
    }
  const l = m.trim();
  if (!l || l.startsWith("--")) return null;
  const f = m.search(/\S/);
  if (f === -1 || !(/^(class|switch|when|if|else|elseif|unless|while|for|with|do|import)\b/i.test(l) || /->\s*$|=>\s*$/.test(l) || /:\s*$/.test(l) || /\{\s*$/.test(l))) return null;
  let c = o.to, s = !1;
  for (let i = o.number + 1; i <= e.doc.lines; i++) {
    const n = e.doc.line(i);
    if (!n.text.trim()) continue;
    if (n.text.search(/\S/) > f)
      c = n.to, s = !0;
    else
      break;
  }
  return s && c > o.to ? { from: o.to, to: c } : null;
});
function q(e) {
  const t = [], a = e.state.doc;
  let o = !1, m = !1;
  const l = [], f = { ")": "(", "]": "[", "}": "{" };
  for (let p = 1; p <= a.lines; p++) {
    const c = a.line(p), s = c.text, i = s.match(/^[\t ]+/);
    if (i && (i[0].includes("	") && (o = !0), i[0].includes(" ") && (m = !0)), !s.includes("[[") && !s.includes("]]") && !s.trim().startsWith("--")) {
      let n = !1, r = !1, d = -1, b = -1;
      for (let h = 0; h < s.length; h++) {
        const k = s[h], S = h > 0 ? s[h - 1] : "";
        k === '"' && !r && S !== "\\" ? (n = !n, n && (d = c.from + h)) : k === "'" && !n && S !== "\\" && (r = !r, r && (b = c.from + h));
      }
      n && t.push({
        from: d,
        to: c.to,
        severity: "error",
        message: "Unclosed double-quoted string literal"
      }), r && t.push({
        from: b,
        to: c.to,
        severity: "error",
        message: "Unclosed single-quoted string literal"
      });
    }
    if (!s.trim().startsWith("--"))
      for (let n = 0; n < s.length; n++) {
        const r = s[n], d = c.from + n;
        if (r === "(" || r === "[" || r === "{")
          l.push({ char: r, pos: d, line: p });
        else if (r === ")" || r === "]" || r === "}") {
          const b = f[r];
          l.length === 0 || l[l.length - 1].char !== b ? t.push({
            from: d,
            to: d + 1,
            severity: "error",
            message: `Unmatched closing bracket '${r}'`
          }) : l.pop();
        }
      }
  }
  for (const p of l)
    t.push({
      from: p.pos,
      to: p.pos + 1,
      severity: "error",
      message: `Unclosed opening bracket '${p.char}'`
    });
  return o && m && t.push({
    from: 0,
    to: a.length > 0 ? 1 : 0,
    severity: "warning",
    message: "Inconsistent indentation: document contains a mix of tabs and spaces"
  }), t;
}
const F = L(q);
function D(e = {}) {
  const t = [I];
  return e.linter && t.push(F), new A(Z, t);
}
export {
  D as moonscript,
  E as moonscriptCompletionSource,
  I as moonscriptFoldService,
  Z as moonscriptLanguage,
  q as moonscriptLintSource,
  F as moonscriptLinter,
  M as moonscriptStreamParser
};
