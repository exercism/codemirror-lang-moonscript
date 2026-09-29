import { buildParser } from "@lezer/generator";
import { fileTests } from "@lezer/generator/dist/test";

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { describe, test } from "bun:test";

const caseDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "cases"
);
const parser = buildParser(
  fs.readFileSync(path.join("src", "syntax.grammar"), "utf8")
);

for (const file of fs.readdirSync(caseDir)) {
  if (!/\.txt$/.test(file)) continue;

  const name = /^[^\.]*/.exec(file)![0];
  describe(name, () => {
    const contents = fs.readFileSync(path.join(caseDir, file), "utf8");
    for (const { name, run } of fileTests(contents, file))
      test(name, () => run(parser));
  });
}
