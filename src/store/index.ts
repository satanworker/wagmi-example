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
  writeContract,
  PrepareWriteContractResult,
  PrepareWriteContractConfig,
  waitForTransaction,
  watchSigner,
  Signer,
  FetchSignerResult,
  sendTransaction,
  WriteContractPreparedArgs,
  Address,
} from "@wagmi/core";
import { create } from "zustand";
import { publicProvider } from "@wagmi/core/providers/public";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
import { counterABI, readCounter } from "../generated";
import { BigNumber as EthersBigNumber, PopulatedTransaction } from "ethers";
import { writeCounter } from "../generated";
import { prepareWriteCounter } from "../generated";
import { CounterService } from "../web3/services/counterService";

type BigNumber = EthersBigNumber;

// TODO: why provider is any
const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli],
  [publicProvider(), publicProvider()]
);

type Chain = GetNetworkResult["chain"];

const initCounterService = () => {
  return new CounterService();
};

type TXConfig = Parameters<typeof writeContract>;
type PrepareTX = () => Promise<WriteContractPreparedArgs<typeof counterABI, string>>;

type PopulatedWagmiTX = Omit<PopulatedTransaction, "to" | "gasLimit"> & {
  to: Address;
  gasLimit: NonNullable<PopulatedTransaction["gasLimit"]>;
};

type PrepareTxBody = PrepareWriteContractConfig | PopulatedWagmiTX;

interface Web3State {
  loading: boolean;
  counterNumber?: BigNumber;
  signer: FetchSignerResult<Signer>;
  setSigner: (signer: FetchSignerResult<Signer>) => void;
  account?: GetAccountResult<Provider>;
  setAccount: (account: GetAccountResult<Provider>) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: () => Promise<void>;
  setChain: (chain: Chain) => Promise<void>;
  getCurrentNumber: () => Promise<void>;
  activeChain?: Chain;
  counterService: CounterService;
  increment: () => Promise<void>;
  incrementEnso: () => Promise<void>;
  // SIMPLE execute tx
  //TODO: how to make generic to either WriteContractPreparedArgs or PopulatedWagmiTX
  executeTx: (params: { prepareTX: () => Promise<PrepareTxBody> }) => void;
}

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors: [new MetaMaskConnector({ chains })],
});

export const useWeb3Store = create<Web3State>()((set, get) => ({
  signer: null,
  loading: false,
  counterService: initCounterService(),
  setAccount: (account) => {
    set({ account });
  },
  setSigner: (signer) => {
    set({ signer });
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
    const currentNumber = await get().counterService.getCounterNumber();
    set({
      loading: false,
      counterNumber: currentNumber,
    });
  },
  increment: async () => {
    get().executeTx({
      // TODO: fix types
      prepareTX: get().counterService.increment,
    });
  },
  incrementEnso: async () => {
    const signer = get().signer;
    if (signer != null) {
      const address = await signer.getAddress();
    }
  },
  executeTx: async ({ prepareTX }) => {
    const config = await prepareTX();
    console.log(config)
    if (isContractConfig(config)) {
      writeContract(config);
    } else {
      console.log(config, 'txs')
    }
  },
}));

function isContractConfig(
  body: PrepareTxBody
  // TODO: make it better with generics
): body is WriteContractPreparedArgs<typeof counterABI, string> {
  return (body as PrepareWriteContractConfig).abi !== undefined;
}

watchAccount((account) => {
  console.log(account);
  useWeb3Store.getState().setAccount(account);
});

watchNetwork((network) => {
  useWeb3Store.getState().setChain(network.chain);
});

watchSigner({}, (signer) => {
  useWeb3Store.getState().setSigner(signer);
});

export const DESIRED_CHAIN_ID = 5;
