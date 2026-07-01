// Loads apps/api/.env before any test file imports config/env.ts, whose
// zod schema requires DATABASE_URL with no default. .env is gitignored
// (local-only), so a fresh checkout has none — .env.example is loaded
// second as a fallback; dotenv never overrides an already-set var, so
// real local values from .env still win when present.
//
// require() (not import) is deliberate: this is a Jest setupFiles entry,
// not a module under test — CommonJS require() runs top-to-bottom in
// source order, while import statements get hoisted regardless of
// position, which would break the load-before-anything-else guarantee.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
