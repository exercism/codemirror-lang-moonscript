export const moonscriptKeywords = new Set([
  'class', 'extends', 'super', 'import', 'export', 'from', 'with', 'using',
  'switch', 'when', 'if', 'else', 'elseif', 'unless', 'while', 'for', 'in',
  'do', 'return', 'break', 'continue', 'local', 'is', 'isnt', 'and', 'or',
  'not', 'then'
]);

export const moonscriptAtoms = new Set([
  'true', 'false', 'nil', 'self'
]);

export const moonscriptBuiltins = new Set([
  'print', 'type', 'tostring', 'tonumber', 'setmetatable', 'getmetatable',
  'pairs', 'ipairs', 'next', 'assert', 'error', 'pcall', 'xpcall', 'select',
  'rawget', 'rawset', 'rawequal', 'collectgarbage', 'load', 'loadfile',
  'dofile', 'require', 'unpack', '_G', '_VERSION'
]);

export const moonscriptStandardModules = new Set([
  'math', 'string', 'table', 'io', 'os', 'coroutine', 'package', 'debug'
]);
