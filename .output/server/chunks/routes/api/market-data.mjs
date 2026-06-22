import { c as defineEventHandler } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const marketData = defineEventHandler((event) => {
  return "Hello market-data";
});

export { marketData as default };
//# sourceMappingURL=market-data.mjs.map
