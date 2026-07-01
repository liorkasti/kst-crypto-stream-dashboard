// Must set this before anything imports config/env.ts, which freezes
// process.env into a parsed constant at module-load time — toggling it
// inside a test body would be too late. dotenv.config() won't override
// an already-set var, so this order is what makes the flag stick.
process.env.SIMULATE_UPSTREAM_DOWN = 'true';
require('dotenv').config();
