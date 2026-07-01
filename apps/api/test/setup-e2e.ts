// Must set this before anything imports config/env.ts, which freezes
// process.env into a parsed constant at module-load time — toggling it
// inside a test body would be too late. dotenv.config() won't override
// an already-set var, so this order is what makes the flag stick.
// Same reasoning for .env vs .env.example: .env is gitignored, so a
// fresh checkout has none — .env.example is loaded second as a
// deterministic fallback without clobbering real local values.
//
// require() (not import) is deliberate here too, for the same hoisting
// reason as jest.setup.ts — imports would be hoisted above the
// process.env assignment above, defeating the ordering this file exists for.
process.env.SIMULATE_UPSTREAM_DOWN = 'true';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
