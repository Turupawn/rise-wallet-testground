import {
  ChainNotConfiguredError,
  ConnectorAlreadyConnectedError,
  ProviderNotFoundError,
  createConnector,
  disconnect,
  getConnectorClient,
  require_react,
  skipToken,
  useChainId,
  useConfig,
  useConnection,
  useMutation,
  useQuery,
  useQueryClient
} from "./chunk-PXVNPBO7.js";
import {
  account_verifyEmail2 as account_verifyEmail,
  decode,
  encode,
  from9 as from,
  toNumber,
  wallet_addFunds,
  wallet_connect,
  wallet_getAdmins,
  wallet_getAssets2 as wallet_getAssets,
  wallet_getPermissions,
  wallet_grantAdmin,
  wallet_grantPermissions,
  wallet_prepareUpgradeAccount2 as wallet_prepareUpgradeAccount,
  wallet_revokeAdmin,
  wallet_revokePermissions,
  wallet_upgradeAccount2 as wallet_upgradeAccount
} from "./chunk-PN5JAHE4.js";
import "./chunk-MKIKYXBK.js";
import {
  createClient,
  custom,
  withRetry
} from "./chunk-JYKHWQDH.js";
import "./chunk-BKCPNO5F.js";
import {
  ChainMismatchError,
  SwitchChainError,
  UserRejectedRequestError,
  numberToHex
} from "./chunk-RQFZO5ND.js";
import "./chunk-DAAUBFM4.js";
import {
  __export,
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/rise-wallet/dist/wagmi/Actions.js
var Actions_exports = {};
__export(Actions_exports, {
  addFunds: () => addFunds2,
  connect: () => connect3,
  disconnect: () => disconnect3,
  getAdmins: () => getAdmins2,
  getAssets: () => getAssets2,
  getPermissions: () => getPermissions2,
  grantAdmin: () => grantAdmin2,
  grantPermissions: () => grantPermissions2,
  revokeAdmin: () => revokeAdmin2,
  revokePermissions: () => revokePermissions2,
  upgradeAccount: () => upgradeAccount2
});

// node_modules/rise-wallet/dist/viem/AccountActions.js
async function verifyEmail(client, parameters) {
  const method = "account_verifyEmail";
  const response = await client.request({
    method,
    params: [encode(account_verifyEmail.Parameters, parameters)]
  });
  return decode(account_verifyEmail.Response, response);
}

// node_modules/rise-wallet/dist/viem/WalletActions.js
async function addFunds(client, parameters) {
  const method = "wallet_addFunds";
  const response = await client.request({
    method,
    params: [encode(wallet_addFunds.Parameters, parameters)]
  });
  return decode(wallet_addFunds.Response, response);
}
async function getAssets(client, ...parameters) {
  const { account = client.account, ...rest } = parameters[0] ?? {};
  const account_ = account ? from(account) : void 0;
  if (!account_)
    throw new Error("account is required");
  const method = "wallet_getAssets";
  const response = await client.request({
    method,
    params: [
      encode(wallet_getAssets.Parameters, {
        ...rest,
        account: account_.address
      })
    ]
  });
  const value = decode(wallet_getAssets.Response, response);
  const decoded = Object.entries(value).reduce((acc, [key, value2]) => {
    acc[toNumber(key)] = value2;
    return acc;
  }, {});
  return decoded;
}
async function connect2(client, parameters = {}) {
  const { chainIds, ...capabilities } = parameters;
  const method = "wallet_connect";
  const response = await client.request({
    method,
    params: [
      encode(wallet_connect.Parameters, {
        capabilities,
        chainIds
      })
    ]
  });
  return decode(wallet_connect.Response, response);
}
async function disconnect2(client) {
  const method = "wallet_disconnect";
  await client.request({
    method
  });
}
async function getAdmins(client, parameters = {}) {
  const method = "wallet_getAdmins";
  const response = await client.request({
    method,
    params: [encode(wallet_getAdmins.Parameters, parameters)]
  });
  return decode(wallet_getAdmins.Response, response);
}
async function getPermissions(client, parameters = {}) {
  const method = "wallet_getPermissions";
  const response = await client.request({
    method,
    params: [encode(wallet_getPermissions.Parameters, parameters)]
  });
  return decode(wallet_getPermissions.Response, response);
}
async function grantAdmin(client, parameters) {
  const method = "wallet_grantAdmin";
  const response = await client.request({
    method,
    params: [encode(wallet_grantAdmin.Parameters, parameters)]
  });
  return decode(wallet_grantAdmin.Response, response);
}
async function grantPermissions(client, parameters) {
  const method = "wallet_grantPermissions";
  const response = await client.request({
    method,
    params: [
      encode(wallet_grantPermissions.Parameters, parameters)
    ]
  });
  return decode(wallet_grantPermissions.Response, response);
}
async function revokeAdmin(client, parameters) {
  const method = "wallet_revokeAdmin";
  await client.request({
    method,
    params: [encode(wallet_revokeAdmin.Parameters, parameters)]
  });
  return void 0;
}
async function revokePermissions(client, parameters) {
  const { address, id, ...capabilities } = parameters;
  const method = "wallet_revokePermissions";
  await client.request({
    method,
    params: [
      encode(wallet_revokePermissions.Parameters, {
        address,
        capabilities,
        id
      })
    ]
  });
  return void 0;
}
async function upgradeAccount(client, parameters) {
  const { account, chainId, ...capabilities } = parameters;
  const method = "wallet_prepareUpgradeAccount";
  const { context, digests } = await client.request({
    method,
    params: [
      encode(wallet_prepareUpgradeAccount.Parameters, {
        address: account.address,
        capabilities,
        chainId
      })
    ]
  });
  const signatures = {
    auth: await account.sign({ hash: digests.auth }),
    exec: await account.sign({ hash: digests.exec })
  };
  const method_upgrade = "wallet_upgradeAccount";
  const response = await client.request({
    method: method_upgrade,
    params: [
      encode(wallet_upgradeAccount.Parameters, {
        context,
        signatures
      })
    ]
  });
  return decode(wallet_upgradeAccount.Response, response);
}

// node_modules/rise-wallet/dist/wagmi/internal/core.js
async function connect3(config, parameters) {
  let connector;
  if (typeof parameters.connector === "function") {
    connector = config._internal.connectors.setup(parameters.connector);
  } else
    connector = parameters.connector;
  if (connector.uid === config.state.current && !parameters.force)
    throw new ConnectorAlreadyConnectedError();
  try {
    config.setState((x) => ({ ...x, status: "connecting" }));
    connector.emitter.emit("message", { type: "connecting" });
    const provider = await connector.getProvider();
    if (!provider)
      throw new ProviderNotFoundError();
    const client = createClient({
      transport: (opts) => custom(provider)({ ...opts, retryCount: 0 })
    });
    const chainIds_request = parameters.chainIds ?? [config.state.chainId];
    const { accounts, chainIds } = await connect2(client, {
      ...parameters,
      chainIds: chainIds_request
    });
    const addresses = accounts.map((x) => x.address);
    await connector.connect({
      chainId: chainIds_request[0],
      isReconnecting: true
    });
    connector.emitter.off("connect", config._internal.events.connect);
    connector.emitter.on("change", config._internal.events.change);
    connector.emitter.on("disconnect", config._internal.events.disconnect);
    await config.storage?.setItem("recentConnectorId", connector.id);
    config.setState((x) => ({
      ...x,
      connections: new Map(x.connections).set(connector.uid, {
        accounts: addresses,
        chainId: chainIds[0],
        connector
      }),
      current: connector.uid,
      status: "connected"
    }));
    return { accounts, chainIds };
  } catch (error) {
    config.setState((x) => ({
      ...x,
      // Keep existing connector connected in case of error
      status: x.current ? "connected" : "disconnected"
    }));
    throw error;
  }
}
async function disconnect3(config, parameters = {}) {
  const connector = (() => {
    if (parameters.connector)
      return parameters.connector;
    const { connections, current } = config.state;
    const connection = connections.get(current);
    return connection?.connector;
  })();
  const provider = await connector?.getProvider();
  await disconnect(config, parameters);
  if (!provider)
    return;
  const client = createClient({
    transport: (opts) => custom(provider)({ ...opts, retryCount: 0 })
  });
  await disconnect2(client);
}
async function addFunds2(config, parameters) {
  const { address, chainId, connector } = parameters;
  const client = await getConnectorClient(config, {
    account: address,
    assertChainId: false,
    chainId,
    connector
  });
  return addFunds(client, parameters);
}
async function getAdmins2(config, parameters) {
  const { address, chainId, connector } = parameters;
  const client = await getConnectorClient(config, {
    account: address,
    assertChainId: false,
    chainId,
    connector
  });
  return getAdmins(client, parameters);
}
async function getAssets2(config, parameters = {}) {
  const { account, connector } = parameters;
  const client = await getConnectorClient(config, {
    account,
    assertChainId: false,
    connector
  });
  return getAssets(client, parameters);
}
async function getPermissions2(config, parameters = {}) {
  const { address, chainId, connector } = parameters;
  const client = await getConnectorClient(config, {
    account: address,
    assertChainId: false,
    chainId,
    connector
  });
  return getPermissions(client, parameters);
}
async function grantAdmin2(config, parameters) {
  const { address, chainId, connector } = parameters;
  const client = await getConnectorClient(config, {
    account: address,
    assertChainId: false,
    chainId,
    connector
  });
  return grantAdmin(client, parameters);
}
async function grantPermissions2(config, parameters) {
  const { address, chainId, connector } = parameters;
  const client = await getConnectorClient(config, {
    account: address,
    assertChainId: false,
    chainId,
    connector
  });
  return grantPermissions(client, parameters);
}
async function revokeAdmin2(config, parameters) {
  const { address, chainId, connector } = parameters;
  const client = await getConnectorClient(config, {
    account: address,
    assertChainId: false,
    chainId,
    connector
  });
  return revokeAdmin(client, parameters);
}
async function revokePermissions2(config, parameters) {
  const { address, chainId, connector } = parameters;
  const client = await getConnectorClient(config, {
    account: address,
    assertChainId: false,
    chainId,
    connector
  });
  return revokePermissions(client, parameters);
}
async function upgradeAccount2(config, parameters) {
  let connector;
  if (typeof parameters.connector === "function") {
    connector = config._internal.connectors.setup(parameters.connector);
  } else
    connector = parameters.connector;
  if (connector.uid === config.state.current)
    throw new ConnectorAlreadyConnectedError();
  if (parameters.chainId && parameters.chainId !== config.state.chainId)
    throw new ChainMismatchError({
      chain: config.chains.find((chain) => chain.id === parameters.chainId) ?? {
        id: parameters.chainId,
        name: `Chain ${parameters.chainId}`
      },
      currentChainId: config.state.chainId
    });
  try {
    config.setState((x) => ({ ...x, status: "connecting" }));
    connector.emitter.emit("message", { type: "connecting" });
    const provider = await connector.getProvider();
    if (!provider)
      throw new ProviderNotFoundError();
    const client = createClient({
      transport: (opts) => custom(provider)({ ...opts, retryCount: 0 })
    });
    await upgradeAccount(client, parameters);
    const data = await connector.connect({
      chainId: parameters.chainId,
      isReconnecting: true
    });
    const accounts = data.accounts;
    connector.emitter.off("connect", config._internal.events.connect);
    connector.emitter.on("change", config._internal.events.change);
    connector.emitter.on("disconnect", config._internal.events.disconnect);
    await config.storage?.setItem("recentConnectorId", connector.id);
    config.setState((x) => ({
      ...x,
      connections: new Map(x.connections).set(connector.uid, {
        accounts,
        chainId: data.chainId,
        connector
      }),
      current: connector.uid,
      status: "connected"
    }));
    return { accounts, chainId: data.chainId };
  } catch (error) {
    config.setState((x) => ({
      ...x,
      // Keep existing connector connected in case of error
      status: x.current ? "connected" : "disconnected"
    }));
    throw error;
  }
}
async function verifyEmail2(config, parameters) {
  const { chainId, connector, walletAddress } = parameters;
  const client = await getConnectorClient(config, {
    account: walletAddress,
    assertChainId: false,
    chainId,
    connector
  });
  return verifyEmail(client, parameters);
}

// node_modules/rise-wallet/dist/wagmi/Connector.js
function porto(parameters = {}) {
  return createConnector((wagmiConfig) => {
    const chains = wagmiConfig.chains ?? parameters.chains ?? [];
    const transports = (() => {
      if (wagmiConfig.transports)
        return wagmiConfig.transports;
      return parameters.transports;
    })();
    let porto_promise;
    let accountsChanged;
    let chainChanged;
    let connect4;
    let disconnect4;
    return {
      async connect({ chainId = chains[0].id, ...rest } = {}) {
        const isReconnecting = "isReconnecting" in rest && rest.isReconnecting || false;
        const withCapabilities = "withCapabilities" in rest && rest.withCapabilities || false;
        let accounts = [];
        let currentChainId;
        if (isReconnecting) {
          ;
          [accounts, currentChainId] = await Promise.all([
            this.getAccounts().catch(() => []),
            this.getChainId().catch(() => void 0)
          ]);
          if (chainId && currentChainId !== chainId) {
            const chain = await this.switchChain({ chainId }).catch((error) => {
              if (error.code === UserRejectedRequestError.code)
                throw error;
              return { id: currentChainId };
            });
            currentChainId = chain?.id ?? currentChainId;
          }
        }
        const provider = await this.getProvider();
        try {
          if (!accounts?.length && !isReconnecting) {
            const res = await provider.request({
              method: "wallet_connect",
              params: [
                {
                  ..."capabilities" in rest ? {
                    capabilities: encode(wallet_connect.Capabilities, rest.capabilities ?? {})
                  } : {},
                  chainIds: [
                    numberToHex(chainId),
                    ...chains.filter((x) => x.id !== chainId).map((x) => numberToHex(x.id))
                  ]
                }
              ]
            });
            accounts = res.accounts;
            currentChainId = Number(res.chainIds[0]);
          }
          if (!currentChainId)
            throw new ChainNotConfiguredError();
          if (connect4) {
            provider.removeListener("connect", connect4);
            connect4 = void 0;
          }
          if (!accountsChanged) {
            accountsChanged = this.onAccountsChanged.bind(this);
            provider.on("accountsChanged", accountsChanged);
          }
          if (!chainChanged) {
            chainChanged = this.onChainChanged.bind(this);
            provider.on("chainChanged", chainChanged);
          }
          if (!disconnect4) {
            disconnect4 = this.onDisconnect.bind(this);
            provider.on("disconnect", disconnect4);
          }
          return {
            accounts: accounts.map((account) => {
              if (typeof account === "object")
                return withCapabilities ? account : account.address;
              return withCapabilities ? { address: account, capabilities: {} } : account;
            }),
            chainId: currentChainId
          };
        } catch (err) {
          const error = err;
          if (error.code === UserRejectedRequestError.code)
            throw new UserRejectedRequestError(error);
          throw error;
        }
      },
      async disconnect() {
        const provider = await this.getProvider();
        if (chainChanged) {
          provider.removeListener("chainChanged", chainChanged);
          chainChanged = void 0;
        }
        if (disconnect4) {
          provider.removeListener("disconnect", disconnect4);
          disconnect4 = void 0;
        }
        if (!connect4) {
          connect4 = this.onConnect.bind(this);
          provider.on("connect", connect4);
        }
        await provider.request({ method: "wallet_disconnect" });
      },
      async getAccounts() {
        const provider = await this.getProvider();
        return provider.request({ method: "eth_accounts" });
      },
      async getChainId() {
        const provider = await this.getProvider();
        const hexChainId = await provider.request({
          method: "eth_chainId"
        });
        return Number(hexChainId);
      },
      async getPortoInstance() {
        porto_promise ??= (async () => {
          const Porto = await import("./Porto-6RZPMS7O.js");
          return Porto.create({
            ...parameters,
            announceProvider: false,
            chains,
            transports
          });
        })();
        return await porto_promise;
      },
      async getProvider() {
        return (await this.getPortoInstance()).provider;
      },
      icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIyIiBoZWlnaHQ9IjQyMiIgdmlld0JveD0iMCAwIDQyMiA0MjIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MjIiIGhlaWdodD0iNDIyIiBmaWxsPSJibGFjayIvPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMV8xNSkiPgo8cGF0aCBkPSJNODEgMjg2LjM2NkM4MSAyODAuODkzIDg1LjQ1MDUgMjc2LjQ1NSA5MC45NDA0IDI3Ni40NTVIMzI5LjUxMUMzMzUuMDAxIDI3Ni40NTUgMzM5LjQ1MiAyODAuODkzIDMzOS40NTIgMjg2LjM2NlYzMDYuMTg4QzMzOS40NTIgMzExLjY2MiAzMzUuMDAxIDMxNi4wOTkgMzI5LjUxMSAzMTYuMDk5SDkwLjk0MDRDODUuNDUwNSAzMTYuMDk5IDgxIDMxMS42NjIgODEgMzA2LjE4OFYyODYuMzY2WiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTAuOTQwNCAyMzQuODI4Qzg1LjQ1MDUgMjM0LjgyOCA4MSAyMzkuMjY2IDgxIDI0NC43MzlWMjcxLjUzMUM4My44NDMyIDI2OS42MzMgODcuMjYyMiAyNjguNTI2IDkwLjk0MDQgMjY4LjUyNkgzMjkuNTExQzMzMy4xODggMjY4LjUyNiAzMzYuNjA4IDI2OS42MzMgMzM5LjQ1MiAyNzEuNTMxVjI0NC43MzlDMzM5LjQ1MiAyMzkuMjY2IDMzNS4wMDEgMjM0LjgyOCAzMjkuNTExIDIzNC44MjhIOTAuOTQwNFpNMzM5LjQ1MiAyODYuMzY2QzMzOS40NTIgMjgwLjg5MyAzMzUuMDAxIDI3Ni40NTUgMzI5LjUxMSAyNzYuNDU1SDkwLjk0MDRDODUuNDUwNSAyNzYuNDU1IDgxIDI4MC44OTMgODEgMjg2LjM2NlYzMDYuMTlDODEgMzExLjY2NCA4NS40NTA1IDMxNi4xMDEgOTAuOTQwNCAzMTYuMTAxSDMyOS41MTFDMzM1LjAwMSAzMTYuMTAxIDMzOS40NTIgMzExLjY2NCAzMzkuNDUyIDMwNi4xOVYyODYuMzY2WiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTAuOTQwNCAxOTMuMjAxQzg1LjQ1MDUgMTkzLjIwMSA4MSAxOTcuNjM4IDgxIDIwMy4xMTJWMjI5LjkwM0M4My44NDMyIDIyOC4wMDYgODcuMjYyMiAyMjYuODk5IDkwLjk0MDQgMjI2Ljg5OUgzMjkuNTExQzMzMy4xODggMjI2Ljg5OSAzMzYuNjA4IDIyOC4wMDYgMzM5LjQ1MiAyMjkuOTAzVjIwMy4xMTJDMzM5LjQ1MiAxOTcuNjM4IDMzNS4wMDEgMTkzLjIwMSAzMjkuNTExIDE5My4yMDFIOTAuOTQwNFpNMzM5LjQ1MiAyNDQuNzM5QzMzOS40NTIgMjM5LjI2NSAzMzUuMDAxIDIzNC44MjggMzI5LjUxMSAyMzQuODI4SDkwLjk0MDRDODUuNDUwNSAyMzQuODI4IDgxIDIzOS4yNjUgODEgMjQ0LjczOVYyNzEuNTNDODEuMjE3NSAyNzEuMzg1IDgxLjQzODMgMjcxLjI0NSA4MS42NjI0IDI3MS4xMDlDODMuODMyNSAyNjkuNzk0IDg2LjMwNTQgMjY4LjkyNyA4OC45NTIzIDI2OC42MzVDODkuNjA1MSAyNjguNTYzIDkwLjI2ODQgMjY4LjUyNiA5MC45NDA0IDI2OC41MjZIMzI5LjUxMUMzMzAuMTgzIDI2OC41MjYgMzMwLjg0NiAyNjguNTYzIDMzMS40OTggMjY4LjYzNUMzMzQuNDE5IDI2OC45NTcgMzM3LjEyOCAyNjkuOTggMzM5LjQ1MiAyNzEuNTNWMjQ0LjczOVpNMzM5LjQ1MiAyODYuMzY2QzMzOS40NTIgMjgxLjAyMSAzMzUuMjA2IDI3Ni42NjMgMzI5Ljg5MyAyNzYuNDYyQzMyOS43NjcgMjc2LjQ1NyAzMjkuNjQgMjc2LjQ1NSAzMjkuNTExIDI3Ni40NTVIOTAuOTQwNEM4NS40NTA1IDI3Ni40NTUgODEgMjgwLjg5MyA4MSAyODYuMzY2VjMwNi4xODhDODEgMzExLjY2MiA4NS40NTA1IDMxNi4xMDEgOTAuOTQwNCAzMTYuMTAxSDMyOS41MTFDMzM1LjAwMSAzMTYuMTAxIDMzOS40NTIgMzExLjY2MiAzMzkuNDUyIDMwNi4xODhWMjg2LjM2NloiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNSIvPgo8cGF0aCBvcGFjaXR5PSIwLjMiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTguMDE0NiAxMDRDODguNjE3NyAxMDQgODEgMTExLjU5NSA4MSAxMjAuOTY1VjE4OC4yNzZDODMuODQzMiAxODYuMzc5IDg3LjI2MjIgMTg1LjI3MiA5MC45NDA0IDE4NS4yNzJIMzI5LjUxMUMzMzMuMTg4IDE4NS4yNzIgMzM2LjYwOCAxODYuMzc5IDMzOS40NTIgMTg4LjI3NlYxMjAuOTY1QzMzOS40NTIgMTExLjU5NSAzMzEuODMzIDEwNCAzMjIuNDM3IDEwNEg5OC4wMTQ2Wk0zMzkuNDUyIDIwMy4xMTJDMzM5LjQ1MiAxOTcuNjM4IDMzNS4wMDEgMTkzLjIwMSAzMjkuNTExIDE5My4yMDFIOTAuOTQwNEM4NS40NTA1IDE5My4yMDEgODEgMTk3LjYzOCA4MSAyMDMuMTEyVjIyOS45MDNDODEuMjE3NSAyMjkuNzU4IDgxLjQzODMgMjI5LjYxOCA4MS42NjI0IDIyOS40ODJDODMuODMyNSAyMjguMTY3IDg2LjMwNTQgMjI3LjMgODguOTUyMyAyMjcuMDA4Qzg5LjYwNTEgMjI2LjkzNiA5MC4yNjg0IDIyNi44OTkgOTAuOTQwNCAyMjYuODk5SDMyOS41MTFDMzMwLjE4MyAyMjYuODk5IDMzMC44NDYgMjI2LjkzNiAzMzEuNDk4IDIyNy4wMDhDMzM0LjQxOSAyMjcuMzMgMzM3LjEyOCAyMjguMzUyIDMzOS40NTIgMjI5LjkwM1YyMDMuMTEyWk0zMzkuNDUyIDI0NC43MzlDMzM5LjQ1MiAyMzkuMzkzIDMzNS4yMDYgMjM1LjAzNiAzMjkuODkzIDIzNC44MzVDMzI5Ljc2NyAyMzQuODMgMzI5LjY0IDIzNC44MjggMzI5LjUxMSAyMzQuODI4SDkwLjk0MDRDODUuNDUwNSAyMzQuODI4IDgxIDIzOS4yNjUgODEgMjQ0LjczOVYyNzEuNTNMODEuMDcwNyAyNzEuNDgzQzgxLjI2NTMgMjcxLjM1NSA4MS40NjI1IDI3MS4yMyA4MS42NjI0IDI3MS4xMDlDODEuOTA4MyAyNzAuOTYgODIuMTU4MSAyNzAuODE3IDgyLjQxMTcgMjcwLjY3OUM4NC4zOTUzIDI2OS42MDUgODYuNjA1NCAyNjguODk0IDg4Ljk1MjMgMjY4LjYzNUM4OS4wMDUyIDI2OC42MjkgODkuMDU4IDI2OC42MjQgODkuMTExIDI2OC42MThDODkuNzEyNSAyNjguNTU3IDkwLjMyMjggMjY4LjUyNiA5MC45NDA0IDI2OC41MjZIMzI5LjUxMUMzMjkuNzM4IDI2OC41MjYgMzI5Ljk2NSAyNjguNTMgMzMwLjE5MiAyNjguNTM5QzMzMC42MzEgMjY4LjU1NSAzMzEuMDY3IDI2OC41ODcgMzMxLjQ5OCAyNjguNjM1QzMzNC40MTkgMjY4Ljk1NyAzMzcuMTI4IDI2OS45OCAzMzkuNDUyIDI3MS41M1YyNDQuNzM5Wk0zMzkuNDUyIDI4Ni4zNjZDMzM5LjQ1MiAyODEuMDIxIDMzNS4yMDYgMjc2LjY2MyAzMjkuODkzIDI3Ni40NjJMMzI5Ljg2NSAyNzYuNDYxQzMyOS43NDggMjc2LjQ1NyAzMjkuNjI5IDI3Ni40NTUgMzI5LjUxMSAyNzYuNDU1SDkwLjk0MDRDODUuNDUwNSAyNzYuNDU1IDgxIDI4MC44OTMgODEgMjg2LjM2NlYzMDYuMTg4QzgxIDMxMS42NjIgODUuNDUwNSAzMTYuMTAxIDkwLjk0MDQgMzE2LjEwMUgzMjkuNTExQzMzNS4wMDEgMzE2LjEwMSAzMzkuNDUyIDMxMS42NjIgMzM5LjQ1MiAzMDYuMTg4VjI4Ni4zNjZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjY5Ljg2OCAxMzEuNzUyQzI2OS44NjggMTI2LjI3OCAyNzQuMzE4IDEyMS44NCAyNzkuODA4IDEyMS44NEgzMTEuNjE4QzMxNy4xMDggMTIxLjg0IDMyMS41NTggMTI2LjI3OCAzMjEuNTU4IDEzMS43NTJWMTYxLjQ4NUMzMjEuNTU4IDE2Ni45NTkgMzE3LjEwOCAxNzEuMzk2IDMxMS42MTggMTcxLjM5NkgyNzkuODA4QzI3NC4zMTggMTcxLjM5NiAyNjkuODY4IDE2Ni45NTkgMjY5Ljg2OCAxNjEuNDg1VjEzMS43NTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzFfMTUiPgo8cmVjdCB3aWR0aD0iMjU5IiBoZWlnaHQ9IjIxMyIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgxIDEwNCkiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",
      id: "xyz.ithaca.porto",
      async isAuthorized() {
        try {
          const accounts = await withRetry(() => this.getAccounts());
          return !!accounts.length;
        } catch {
          return false;
        }
      },
      name: "Porto",
      async onAccountsChanged(accounts) {
        wagmiConfig.emitter.emit("change", {
          accounts
        });
      },
      onChainChanged(chain) {
        const chainId = Number(chain);
        wagmiConfig.emitter.emit("change", { chainId });
      },
      async onConnect(connectInfo) {
        const accounts = await this.getAccounts();
        if (accounts.length === 0)
          return;
        const chainId = Number(connectInfo.chainId);
        wagmiConfig.emitter.emit("connect", { accounts, chainId });
        const provider = await this.getProvider();
        if (provider) {
          if (connect4) {
            provider.removeListener("connect", connect4);
            connect4 = void 0;
          }
          if (!accountsChanged) {
            accountsChanged = this.onAccountsChanged.bind(this);
            provider.on("accountsChanged", accountsChanged);
          }
          if (!chainChanged) {
            chainChanged = this.onChainChanged.bind(this);
            provider.on("chainChanged", chainChanged);
          }
          if (!disconnect4) {
            disconnect4 = this.onDisconnect.bind(this);
            provider.on("disconnect", disconnect4);
          }
        }
      },
      async onDisconnect(_error) {
        const provider = await this.getProvider();
        wagmiConfig.emitter.emit("disconnect");
        if (provider) {
          if (chainChanged) {
            provider.removeListener("chainChanged", chainChanged);
            chainChanged = void 0;
          }
          if (disconnect4) {
            provider.removeListener("disconnect", disconnect4);
            disconnect4 = void 0;
          }
          if (!connect4) {
            connect4 = this.onConnect.bind(this);
            provider.on("connect", connect4);
          }
        }
      },
      async setup() {
        if (!connect4) {
          const provider = await this.getProvider();
          connect4 = this.onConnect.bind(this);
          provider.on("connect", connect4);
        }
      },
      async switchChain({ chainId }) {
        const chain = chains.find((x) => x.id === chainId);
        if (!chain)
          throw new SwitchChainError(new ChainNotConfiguredError());
        const provider = await this.getProvider();
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: numberToHex(chainId) }]
        });
        return chain;
      },
      type: "injected"
    };
  });
}

// node_modules/rise-wallet/dist/wagmi/Hooks.js
var Hooks_exports = {};
__export(Hooks_exports, {
  useAddFunds: () => useAddFunds,
  useAdmins: () => useAdmins,
  useAssets: () => useAssets,
  useConnect: () => useConnect,
  useDisconnect: () => useDisconnect,
  useGrantAdmin: () => useGrantAdmin,
  useGrantPermissions: () => useGrantPermissions,
  usePermissions: () => usePermissions,
  useRevokeAdmin: () => useRevokeAdmin,
  useRevokePermissions: () => useRevokePermissions,
  useUpgradeAccount: () => useUpgradeAccount,
  useVerifyEmail: () => useVerifyEmail
});

// node_modules/rise-wallet/dist/wagmi/internal/react.js
var import_react = __toESM(require_react(), 1);

// node_modules/rise-wallet/dist/wagmi/internal/utils.js
function filterQueryOptions(options) {
  const {
    // import('@tanstack/query-core').QueryOptions
    _defaulted,
    behavior,
    gcTime,
    initialData,
    initialDataUpdatedAt,
    maxPages,
    meta,
    networkMode,
    queryFn,
    queryHash,
    queryKey,
    queryKeyHashFn,
    retry,
    retryDelay,
    structuralSharing,
    // import('@tanstack/query-core').InfiniteQueryObserverOptions
    getPreviousPageParam,
    getNextPageParam,
    initialPageParam,
    // import('@tanstack/react-query').UseQueryOptions
    _optimisticResults,
    enabled,
    notifyOnChangeProps,
    placeholderData,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retryOnMount,
    select,
    staleTime,
    suspense,
    throwOnError,
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // wagmi
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    config,
    connector,
    query,
    ...rest
  } = options;
  return rest;
}

// node_modules/rise-wallet/dist/wagmi/internal/query.js
function getAdminsQueryKey(options = {}) {
  const { connector, ...parameters } = options;
  return [
    "admins",
    { ...filterQueryOptions(parameters), connectorUid: connector?.uid }
  ];
}
function getPermissionsQueryKey(options = {}) {
  const { connector, ...parameters } = options;
  return [
    "permissions",
    { ...filterQueryOptions(parameters), connectorUid: connector?.uid }
  ];
}
function getAssetsQueryKey(options) {
  const { connector, ...parameters } = options;
  return [
    "assets",
    { ...filterQueryOptions(parameters), connectorUid: connector?.uid }
  ];
}

// node_modules/rise-wallet/dist/wagmi/internal/react.js
function useAddFunds(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return addFunds2(config, variables);
    },
    mutationKey: ["addFunds"]
  });
}
function useAdmins(parameters = {}) {
  const { query = {}, ...rest } = parameters;
  const config = useConfig(rest);
  const queryClient = useQueryClient();
  const chainId = useChainId({ config });
  const { address, connector, status } = useConnection();
  const activeConnector = parameters.connector ?? connector;
  const enabled = Boolean((status === "connected" || status === "reconnecting" && activeConnector?.getProvider) && (query.enabled ?? true));
  const queryKey = (0, import_react.useMemo)(() => getAdminsQueryKey({
    address,
    chainId: parameters.chainId ?? chainId,
    connector: activeConnector
  }), [address, chainId, parameters.chainId, activeConnector]);
  const provider = (0, import_react.useRef)(void 0);
  (0, import_react.useEffect)(() => {
    if (!activeConnector)
      return;
    void (async () => {
      provider.current ??= await activeConnector.getProvider?.();
      provider.current?.on("message", (event) => {
        if (event.type !== "adminsChanged")
          return;
        queryClient.invalidateQueries({ queryKey });
      });
    })();
  }, [address, activeConnector, queryClient]);
  return useQuery({
    ...query,
    enabled,
    gcTime: 0,
    queryFn: activeConnector ? async (context) => {
      const { connectorUid: _, ...options } = context.queryKey[1];
      provider.current ??= await activeConnector.getProvider();
      return await getAdmins2(config, {
        ...options,
        connector: activeConnector
      });
    } : skipToken,
    queryKey,
    staleTime: Number.POSITIVE_INFINITY
  });
}
function useAssets(parameters = {}) {
  const { assetFilter, assetTypeFilter, chainFilter, query = {}, ...rest } = parameters;
  const config = useConfig(rest);
  const queryClient = useQueryClient();
  const { address, connector, status } = useConnection();
  const account = parameters.account ?? address;
  const activeConnector = parameters.connector ?? connector;
  const enabled = Boolean(account && (status === "connected" || status === "reconnecting" && activeConnector?.getProvider) && (query.enabled ?? true));
  const queryKey = (0, import_react.useMemo)(() => getAssetsQueryKey({
    account,
    assetFilter,
    assetTypeFilter,
    chainFilter,
    connector: activeConnector
  }), [account, activeConnector, assetFilter, assetTypeFilter, chainFilter]);
  const provider = (0, import_react.useRef)(void 0);
  (0, import_react.useEffect)(() => {
    if (!activeConnector)
      return;
    void (async () => {
      provider.current ??= await activeConnector.getProvider?.();
      provider.current?.on("message", (event) => {
        if (event.type !== "assetsChanged")
          return;
        queryClient.invalidateQueries({ queryKey });
      });
    })();
  }, [address, activeConnector, queryClient]);
  return useQuery({
    ...query,
    enabled,
    gcTime: 0,
    queryFn: activeConnector ? async (context) => {
      const { connectorUid: _, ...options } = context.queryKey[1];
      provider.current ??= await activeConnector.getProvider();
      return await getAssets2(config, {
        ...options,
        connector: activeConnector
      });
    } : skipToken,
    queryKey,
    staleTime: Number.POSITIVE_INFINITY
  });
}
function useConnect(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return connect3(config, variables);
    },
    mutationKey: ["connect"]
  });
}
function useDisconnect(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      await disconnect3(config, variables);
    },
    mutationKey: ["disconnect"]
  });
}
function useGrantAdmin(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return grantAdmin2(config, variables);
    },
    mutationKey: ["grantAdmin"]
  });
}
function useGrantPermissions(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return grantPermissions2(config, variables);
    },
    mutationKey: ["grantPermissions"]
  });
}
function usePermissions(parameters = {}) {
  const { query = {}, ...rest } = parameters;
  const config = useConfig(rest);
  const queryClient = useQueryClient();
  const chainId = useChainId({ config });
  const { address, connector, status } = useConnection();
  const activeConnector = parameters.connector ?? connector;
  const enabled = Boolean((status === "connected" || status === "reconnecting" && activeConnector?.getProvider) && (query.enabled ?? true));
  const queryKey = (0, import_react.useMemo)(() => getPermissionsQueryKey({
    address,
    chainId: parameters.chainId ?? chainId,
    connector: activeConnector
  }), [address, chainId, parameters.chainId, activeConnector]);
  const provider = (0, import_react.useRef)(void 0);
  (0, import_react.useEffect)(() => {
    if (!activeConnector)
      return;
    void (async () => {
      provider.current ??= await activeConnector.getProvider?.();
      provider.current?.on("message", (event) => {
        if (event.type !== "permissionsChanged")
          return;
        queryClient.invalidateQueries({ queryKey });
      });
    })();
  }, [address, activeConnector, queryClient]);
  return useQuery({
    ...query,
    enabled,
    gcTime: 0,
    queryFn: activeConnector ? async (context) => {
      const { connectorUid: _, ...options } = context.queryKey[1];
      provider.current ??= await activeConnector.getProvider();
      return await getPermissions2(config, {
        ...options,
        connector: activeConnector
      });
    } : skipToken,
    queryKey,
    staleTime: Number.POSITIVE_INFINITY
  });
}
function useRevokeAdmin(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return revokeAdmin2(config, variables);
    },
    mutationKey: ["revokeAdmin"]
  });
}
function useRevokePermissions(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return revokePermissions2(config, variables);
    },
    mutationKey: ["revokePermissions"]
  });
}
function useUpgradeAccount(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return upgradeAccount2(config, variables);
    },
    mutationKey: ["upgradeAccount"]
  });
}
function useVerifyEmail(parameters = {}) {
  const { mutation } = parameters;
  const config = useConfig(parameters);
  return useMutation({
    ...mutation,
    async mutationFn(variables) {
      return verifyEmail2(config, variables);
    },
    mutationKey: ["verifyEmail"]
  });
}

// node_modules/rise-wallet/dist/wagmi/Query.js
var Query_exports = {};
__export(Query_exports, {
  getAdminsQueryKey: () => getAdminsQueryKey,
  getAssetsQueryKey: () => getAssetsQueryKey,
  getPermissionsQueryKey: () => getPermissionsQueryKey
});
export {
  Actions_exports as Actions,
  Hooks_exports as Hooks,
  Query_exports as Query,
  porto
};
//# sourceMappingURL=rise-wallet_wagmi.js.map
