import {
  configureChains,
  mainnet,
  createClient,
  watchAccount,
  watchNetwork,
  GetAccountResult,
  GetNetworkResult,
  connect,
  disconnect,
  readContract,
  Provider,
  goerli,
} from "@wagmi/core";
import { create } from "zustand";
import { publicProvider } from "@wagmi/core/providers/public";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
import { readCounter } from "../generated";
import { BigNumber as EthersBigNumber } from "ethers";

type BigNumber = EthersBigNumber;

// TODO: why provider is any
const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli],
  [publicProvider(), publicProvider()]
);

type Chain = GetNetworkResult["chain"];

interface Web3State {
  loading: boolean;
  counterNumber?: BigNumber;
  account?: GetAccountResult<Provider>;
  setAccount: (account: GetAccountResult<Provider>) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: () => Promise<void>;
  setChain: (chain: Chain) => Promise<void>;
  getCurrentNumber: () => Promise<void>;
  activeChain?: Chain;
}

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors: [new MetaMaskConnector({ chains })],
});

export const useWeb3Store = create<Web3State>()((set, get) => ({
  client,
  loading: false,
  setAccount: (account) => {
    set({ account });
  },
  connect: async () => {
    await get().disconnect();
    const result = await connect({
      connector: client.connectors[0],
      chainId: DESIRED_CHAIN_ID,
    });
  },
  disconnect: async () => {
    await disconnect();
  },
  switchChain: async () => {
    if (client.connector && client.connector.switchChain) {
      await client.connector.switchChain?.(DESIRED_CHAIN_ID);
    } else {
      await get().disconnect();
      await get().connect();
    }
  },
  setChain: async (chain) => {
    set({ activeChain: chain });
  },
  getCurrentNumber: async () => {
    set({ loading: true });
    const currentNumber = await readCounter({
      functionName: "getCurrentNumber",
      address: COUNTER_ADDRESS,
    });
    set({
      loading: false,
      counterNumber: currentNumber,
    });
  },
}));

watchAccount((account) => {
  useWeb3Store.getState().setAccount(account);
});

watchNetwork((network) => {
  useWeb3Store.getState().setChain(network.chain);
});

export const COUNTER_ADDRESS = "0xfC5F404bEC816C6DC4F1ef4370C96bc5d0c561A9";
export const DESIRED_CHAIN_ID = 5;
