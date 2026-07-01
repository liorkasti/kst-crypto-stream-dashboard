// Loads apps/api/.env before any test file imports config/env.ts, whose
// zod schema requires DATABASE_URL with no default.
require('dotenv').config();
