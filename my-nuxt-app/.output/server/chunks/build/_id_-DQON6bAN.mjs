import { b as useRoute, a as __nuxt_component_0 } from './server.mjs';
import { computed, withAsyncContext, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useFetch } from './fetch-CDItoWuo.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@vue/shared';

const _sfc_main = {
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const productId = computed(() => route.params.id);
    const { data: product, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/products/${productId.value}`,
      {
        lazy: true
      },
      "$T63jtLdxFf"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><h2>🔍 安全串接驗證頁面</h2>`);
      if (unref(pending)) {
        _push(`<div>正在透過安全網閘讀取資料...</div>`);
      } else if (unref(error)) {
        _push(`<div style="${ssrRenderStyle({ "color": "red" })}">讀取失敗：${ssrInterpolate(unref(error).message)}</div>`);
      } else if (unref(product)) {
        _push(`<div style="${ssrRenderStyle({ "background": "#eef9f4", "padding": "15px", "border-radius": "4px" })}"><p>商品編號: <strong>${ssrInterpolate(unref(product).id)}</strong></p><p>商品名稱: <strong>${ssrInterpolate(unref(product).name)}</strong></p><p>商品價格: <strong>$${ssrInterpolate(unref(product).price)}</strong></p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<br>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/products" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`⬅️ 返回列表`);
          } else {
            return [
              createTextVNode("⬅️ 返回列表")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DQON6bAN.mjs.map
