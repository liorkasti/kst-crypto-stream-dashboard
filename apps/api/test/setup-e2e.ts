// Must set this before anything imports config/env.ts, which freezes
// process.env into a parsed constant at module-load time — toggling it
// inside a test body would be too late. dotenv.config() won't override
// an already-set var, so this order is what makes the flag stick.
// Same reasoning for .env vs .env.example: .env is gitignored, so a
// fresh checkout has none — .env.example is loaded second as a
// deterministic fallback without clobbering real local values.
process.env.SIMULATE_UPSTREAM_DOWN = 'true';
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
