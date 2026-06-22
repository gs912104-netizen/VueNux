import { c as defineEventHandler, g as getRouterParam, u as useRuntimeConfig, e as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _id_ = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const config = useRuntimeConfig();
  const dotnetApiBase = config.public.apiBase || "http://localhost:5031";
  try {
    const data = await $fetch(`${dotnetApiBase}/api/product/${id}`, {
      headers: {
        "Authorization": "Bearer SERVER_SECRET_TOKEN_HERE",
        // 機密金鑰，絕對不會外流到瀏覽器
        "X-Internal-Client": "NuxtServer"
      }
    });
    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "\u5F8C\u7AEF\u91D1\u878D\u6838\u5FC3\u7CFB\u7D71\u9023\u7DDA\u5931\u6557"
    });
  }
});

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map
