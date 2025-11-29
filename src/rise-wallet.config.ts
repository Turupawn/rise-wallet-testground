import { Chains, Porto } from "rise-wallet";
import { porto } from "rise-wallet/wagmi";
import { http } from "viem";
import { createConfig } from "wagmi";

export const portoConnector = porto(Porto.defaultConfig);

export const config = createConfig({
  chains: [Chains.riseTestnet],
  connectors: [portoConnector],
  transports: {
    [Chains.riseTestnet.id]: http("https://testnet.riselabs.xyz"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

