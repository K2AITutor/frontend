// Regression check for web route protection (audit item PUB-07).
// 1. Role rules: who may open which protected prefix (lib/roleRouting.ts).
// 2. Every protected prefix is listed in the middleware matcher, so the rule is actually enforced.
// Run from the frontend root: npm run test:route-access
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const webSrc = path.join(root, "apps", "web", "src");
const routingPath = path.join(webSrc, "lib", "roleRouting.ts");
const middlewarePath = path.join(webSrc, "middleware.ts");

const compiled = ts.transpileModule(fs.readFileSync(routingPath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const sandbox = { exports: {}, module: { exports: {} } };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(compiled.outputText, sandbox, { filename: routingPath });

const { routeAccessMap, isRoleAllowedForPath } = sandbox.module.exports;
if (typeof isRoleAllowedForPath !== "function" || !routeAccessMap) {
  throw new Error("routeAccessMap / isRoleAllowedForPath exports were not found.");
}

const failures = [];

// [pathname, role, expected]
const cases = [
  // PUB-07: exam attempt pages are student-only.
  ["/exam/abc-123/review", "student", true],
  ["/exam/abc-123", "student", true],
  ["/exam", "student", true],
  ["/exam/abc-123/review", "admin", false],
  ["/exam/abc-123/review", "contributor", false],
  ["/exam/abc-123/review", "teacher", false],
  ["/exam/abc-123/review", "parent", false],
  ["/exam/abc-123/review", "", false],
  ["/exam/abc-123/review", undefined, false],

  // PUB-07: internal tools are admin/contributor-only.
  ["/tools/pdf-cropper", "admin", true],
  ["/tools/pdf-cropper", "contributor", true],
  ["/tools", "admin", true],
  ["/tools/pdf-cropper", "student", false],
  ["/tools/pdf-cropper", "teacher", false],
  ["/tools/pdf-cropper", "parent", false],
  ["/tools/pdf-cropper", "", false],

  // Role value is normalised before comparing.
  ["/tools/pdf-cropper", " Admin ", true],
  ["/exam/abc-123/review", "STUDENT", true],

  // Existing areas keep their rules.
  ["/admin", "admin", true],
  ["/admin/models", "contributor", false],
  ["/contributor/dataset-qa", "contributor", true],
  ["/contributor/dataset-qa", "teacher", true],
  ["/contributor/dataset-qa", "admin", true],
  ["/contributor/dataset-qa", "student", false],
  ["/student", "student", true],
  ["/student/practice", "parent", false],
  ["/teacher/review", "teacher", true],
  ["/teacher/review", "admin", false],
  ["/parent/children", "parent", true],
  ["/parent/children", "student", false],

  // Matching is per path segment: look-alike and public paths are not caught.
  ["/exams/VCE_MM_EXAM1_2025/exam.pdf", "", true],
  ["/exams/VCE_MM_EXAM1_2025/meta.json", "contributor", true],
  ["/toolsmith", "student", true],
  ["/pricing", "", true],
  ["/", "", true],
];

for (const [pathname, role, expected] of cases) {
  const actual = isRoleAllowedForPath(pathname, role);
  if (actual !== expected) {
    failures.push(
      `isRoleAllowedForPath(${JSON.stringify(pathname)}, ${JSON.stringify(role)}) = ${actual}, expected ${expected}`,
    );
  }
}

// The matcher is a static literal in middleware.ts, so it can drift from the rule map.
const middlewareSource = fs.readFileSync(middlewarePath, "utf8");
const matcherBlock = /matcher:\s*\[([\s\S]*?)\]/.exec(middlewareSource);
if (!matcherBlock) {
  failures.push("config.matcher was not found in middleware.ts");
} else {
  const matchers = [...matcherBlock[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
  for (const prefix of Object.keys(routeAccessMap)) {
    const expectedMatcher = `/${prefix}/:path*`;
    if (!matchers.includes(expectedMatcher)) {
      failures.push(
        `middleware matcher is missing ${JSON.stringify(expectedMatcher)}: /${prefix}/* would not be protected`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Route access check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Route access check passed (${cases.length} role cases, ${Object.keys(routeAccessMap).length} protected prefixes covered by the middleware matcher).`,
);
