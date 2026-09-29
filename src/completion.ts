import {
  Completion,
  CompletionContext,
  CompletionResult,
  snippetCompletion
} from '@codemirror/autocomplete';
import {
  moonscriptKeywords,
  moonscriptAtoms,
  moonscriptBuiltins,
  moonscriptStandardModules
} from './constants';

const keywordCompletions: Completion[] = Array.from(moonscriptKeywords).map((word) => ({
  label: word,
  type: 'keyword',
  boost: 1
}));

const atomCompletions: Completion[] = Array.from(moonscriptAtoms).map((word) => ({
  label: word,
  type: 'atom',
  boost: 2
}));

const builtinCompletions: Completion[] = Array.from(moonscriptBuiltins).map((word) => ({
  label: word,
  type: 'function',
  detail: 'Lua/MoonScript builtin',
  boost: 2
}));

const moduleCompletions: Completion[] = Array.from(moonscriptStandardModules).map((word) => ({
  label: word,
  type: 'namespace',
  detail: 'Standard module',
  boost: 3
}));

const snippetCompletions: Completion[] = [
  snippetCompletion('class ${ClassName}\n  new: (@${param}) =>\n    ${cursor}', {
    label: 'class',
    detail: 'MoonScript class definition',
    type: 'snippet',
    boost: 5
  }),
  snippetCompletion('class ${ClassName} extends ${Parent}\n  new: (@${param}) =>\n    super!\n    ${cursor}', {
    label: 'class extends',
    detail: 'Class inheritance definition',
    type: 'snippet',
    boost: 5
  }),
  snippetCompletion('(${args}) ->\n  ${cursor}', {
    label: 'fn ->',
    detail: 'Anonymous function',
    type: 'snippet',
    boost: 4
  }),
  snippetCompletion('(${args}) =>\n  ${cursor}', {
    label: 'fn =>',
    detail: 'Bound function (self)',
    type: 'snippet',
    boost: 4
  }),
  snippetCompletion('switch ${expr}\n  when ${val1}\n    ${cursor}\n  else\n    ', {
    label: 'switch',
    detail: 'Switch/when pattern match',
    type: 'snippet',
    boost: 4
  }),
  snippetCompletion('with ${object}\n  .${property} = ${value}\n  ${cursor}', {
    label: 'with',
    detail: 'With expression block',
    type: 'snippet',
    boost: 4
  }),
  snippetCompletion('for ${item} in *${list}\n  ${cursor}', {
    label: 'for in *',
    detail: 'List iteration loop',
    type: 'snippet',
    boost: 4
  }),
  snippetCompletion('for ${k}, ${v} in pairs ${tbl}\n  ${cursor}', {
    label: 'for in pairs',
    detail: 'Table key-value iteration',
    type: 'snippet',
    boost: 4
  }),
  snippetCompletion('import ${name} from ${module}', {
    label: 'import from',
    detail: 'MoonScript import',
    type: 'snippet',
    boost: 4
  })
];

const moduleMembers: Record<string, Completion[]> = {
  math: [
    'abs', 'acos', 'asin', 'atan', 'ceil', 'cos', 'deg', 'exp', 'floor',
    'fmod', 'log', 'max', 'min', 'modf', 'pow', 'rad', 'random', 'randomseed',
    'sin', 'sqrt', 'tan', 'pi', 'huge'
  ].map((name) => ({ label: name, type: 'function', detail: 'math library' })),

  string: [
    'byte', 'char', 'dump', 'find', 'format', 'gmatch', 'gsub', 'len',
    'lower', 'match', 'rep', 'reverse', 'sub', 'upper'
  ].map((name) => ({ label: name, type: 'function', detail: 'string library' })),

  table: [
    'concat', 'insert', 'move', 'pack', 'remove', 'sort', 'unpack'
  ].map((name) => ({ label: name, type: 'function', detail: 'table library' })),

  io: [
    'close', 'flush', 'input', 'lines', 'open', 'output', 'popen', 'read',
    'tmpfile', 'type', 'write'
  ].map((name) => ({ label: name, type: 'function', detail: 'io library' })),

  os: [
    'clock', 'date', 'difftime', 'execute', 'exit', 'getenv', 'remove',
    'rename', 'setlocale', 'time', 'tmpname'
  ].map((name) => ({ label: name, type: 'function', detail: 'os library' })),

  coroutine: [
    'create', 'resume', 'running', 'status', 'wrap', 'yield', 'isyieldable'
  ].map((name) => ({ label: name, type: 'function', detail: 'coroutine library' }))
};

/**
 * Autocompletion source provider for MoonScript.
 */
export function moonscriptCompletionSource(context: CompletionContext): CompletionResult | null {
  const dotMatch = context.matchBefore(/([a-zA-Z_]\w*)\.\w*$/);
  if (dotMatch) {
    const moduleName = dotMatch.text.split('.')[0];
    if (moduleMembers[moduleName]) {
      const from = dotMatch.from + moduleName.length + 1;
      return {
        from,
        options: moduleMembers[moduleName],
        validFor: /^\w*$/
      };
    }
  }

  const selfMatch = context.matchBefore(/@@?\w*$/);
  if (selfMatch) {
    return {
      from: selfMatch.from,
      options: [
        { label: '@', type: 'property', detail: 'self' },
        { label: '@@', type: 'property', detail: 'class' }
      ],
      validFor: /^@@?\w*$/
    };
  }

  const word = context.matchBefore(/[a-zA-Z_]\w*$/);
  if (!word && !context.explicit) return null;

  const from = word ? word.from : context.pos;

  const docText = context.state.doc.toString();
  const documentWords = new Set<string>();
  const idRegex = /\b[a-zA-Z_]\w*\b/g;
  let match: RegExpExecArray | null;
  while ((match = idRegex.exec(docText)) !== null) {
    const id = match[0];
    if (!moonscriptKeywords.has(id) && !moonscriptBuiltins.has(id) && !moonscriptStandardModules.has(id)) {
      documentWords.add(id);
    }
  }

  const docCompletions: Completion[] = Array.from(documentWords).map((w) => ({
    label: w,
    type: 'variable',
    detail: 'Local variable'
  }));

  const allCompletions: Completion[] = [
    ...snippetCompletions,
    ...keywordCompletions,
    ...atomCompletions,
    ...builtinCompletions,
    ...moduleCompletions,
    ...docCompletions
  ];

  return {
    from,
    options: allCompletions,
    validFor: /^[a-zA-Z_]\w*$/
  };
}
