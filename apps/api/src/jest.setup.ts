// Loads apps/api/.env before any test file imports config/env.ts, whose
// zod schema requires DATABASE_URL with no default. .env is gitignored
// (local-only), so a fresh checkout has none — .env.example is loaded
// second as a fallback; dotenv never overrides an already-set var, so
// real local values from .env still win when present.
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
