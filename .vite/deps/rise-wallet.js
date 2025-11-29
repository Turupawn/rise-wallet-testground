import {
  Chains_exports,
  Dialog_exports,
  Messenger_exports,
  Porto_exports,
  RelayActions_exports,
  Storage_exports,
  Transport_exports,
  authSession,
  dialog,
  from,
  from2,
  isReactNative,
  relay
} from "./chunk-SUTNBOVA.js";
import {
  Account_exports,
  Key_exports,
  RpcSchema_exports
} from "./chunk-PN5JAHE4.js";
import "./chunk-MKIKYXBK.js";
import "./chunk-JYKHWQDH.js";
import "./chunk-BKCPNO5F.js";
import "./chunk-RQFZO5ND.js";
import "./chunk-DAAUBFM4.js";
import {
  __export
} from "./chunk-G3PMV62Z.js";

// node_modules/rise-wallet/dist/core/Mode.js
var Mode_exports = {};
__export(Mode_exports, {
  dialog: () => dialog,
  from: () => from2,
  reactNative: () => reactNative,
  relay: () => relay
});

// node_modules/rise-wallet/dist/core/internal/modes/reactNative.js
function reactNative(parameters = {}) {
  if (!isReactNative())
    return parameters.fallback ?? from2({ actions: relay().actions, name: "relay" });
  const { redirectUri, requestOptions, ...baseParameters } = parameters;
  return from2({
    ...dialog({
      ...baseParameters,
      renderer: authSession({ redirectUri, requestOptions })
    }),
    name: "reactNative"
  });
}
export {
  Account_exports as Account,
  Chains_exports as Chains,
  Dialog_exports as Dialog,
  Key_exports as Key,
  Messenger_exports as Messenger,
  Mode_exports as Mode,
  Porto_exports as Porto,
  RelayActions_exports as RelayActions,
  RpcSchema_exports as RpcSchema,
  Storage_exports as Storage,
  Transport_exports as Transport,
  from
};
//# sourceMappingURL=rise-wallet.js.map
