// Must be set before config/env.ts parses process.env — import hoisting
// would reorder an `import` above this, so require() is used instead.
// Same .env/.env.example fallback reasoning as jest.setup.ts.
process.env.SIMULATE_UPSTREAM_DOWN = 'true';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
