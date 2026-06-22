import { c as defineEventHandler, u as useRuntimeConfig, e as createError } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const index = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const dotnetApiBase = config.public.apiBase || "http://localhost:5031";
  try {
    const data = await $fetch(`${dotnetApiBase}/api/product`, {
      headers: {
        "Authorization": "Bearer SERVER_SECRET_TOKEN_HERE"
      }
    });
    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "\u7121\u6CD5\u53D6\u5F97\u5F8C\u7AEF\u5546\u54C1\u5217\u8868\u8CC7\u6599"
    });
  }
});

export { index as default };
//# sourceMappingURL=index.mjs.map
