// .env is gitignored, so a fresh checkout has none — .env.example is a
// fallback dotenv won't let override real values. require() (not import)
// avoids ES import hoisting reordering this before it should run.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
require('dotenv').config({ path: path.resolve(__dirname, '../.env.example') });
