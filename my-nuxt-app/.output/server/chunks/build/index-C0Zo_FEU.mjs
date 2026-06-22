import { a as __nuxt_component_0 } from './server.mjs';
import { withAsyncContext, unref, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: products, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products",
      {
        lazy: true
      },
      "$Yl7a8VsQzt"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><h2>📦 產品列表頁面 (.NET 10 聯動版)</h2><p>點擊下方產品，測試「動態路由」與後端 API 串接：</p>`);
      if (unref(pending)) {
        _push(`<div>正在向伺服器請求最新商品報價...</div>`);
      } else if (unref(error)) {
        _push(`<div style="${ssrRenderStyle({ "color": "red" })}">載入失敗：${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<ul><!--[-->`);
        ssrRenderList(unref(products), (item) => {
          _push(`<li style="${ssrRenderStyle({ "margin-bottom": "10px" })}">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/products/${item.id}`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<strong style="${ssrRenderStyle({ "color": "#41B883" })}"${_scopeId}>${ssrInterpolate(item.name)}</strong> (ID: ${ssrInterpolate(item.id)}) - 當前淨值: $${ssrInterpolate(item.price)}`);
              } else {
                return [
                  createVNode("strong", { style: { "color": "#41B883" } }, toDisplayString(item.name), 1),
                  createTextVNode(" (ID: " + toDisplayString(item.id) + ") - 當前淨值: $" + toDisplayString(item.price), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`<br>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`⬅️ 返回首頁`);
          } else {
            return [
              createTextVNode("⬅️ 返回首頁")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C0Zo_FEU.mjs.map
