import {
  prepareWriteCounter,
  readCounter,
  writeCounter,
} from "../../generated";
import {
  chains,
  Builder,
  populateShortcutTransaction,
  Chain,
} from "@ensofinance/shortcuts-sdk";
import { contractCall } from "@ensofinance/shortcuts-sdk/builder";
import { counterABI } from "../../generated";
import { PopulatedTransaction, ethers } from "ethers";
import {
  Address,
  goerli,
  prepareSendTransaction,
  sendTransaction,
  writeContract,
} from "@wagmi/core";

export class CounterService {
  constructor() {}

  async getCounterNumber() {
    return readCounter({
      functionName: "getCurrentNumber",
      chainId: 5,
    });
  }

  async increment() {
    return prepareWriteCounter({
      functionName: "increment",
    });
  }

  async decrement() {
    return prepareWriteCounter({
      functionName: "decrement",
    });
  }

  async incrementEnso(account: string, signer: ethers.Signer) {
    const ensoGoereli: Chain = {
      id: goerli.id,
      name: goerli.name,
      rpcUrls: {
        alchemy: goerli.rpcUrls.alchemy.http[0],
        default: goerli.rpcUrls.default.http[0],
        public: goerli.rpcUrls.public.http[0],
      },
    };

    let builder = new Builder(account, ensoGoereli);

    const increment = await builder.add({
      address: "0xfC5F404bEC816C6DC4F1ef4370C96bc5d0c561A9",
      functionName: "increment",
      args: [],
    });

    const { shortcut } = builder.build();

    const result = await populateShortcutTransaction(signer, shortcut, []);
    if (result.success) {
      const tx = result.transaction as Omit<
        PopulatedTransaction,
        "to" | "gasLimit"
      > & {
        to: Address;
        gasLimit: NonNullable<PopulatedTransaction["gasLimit"]>;
      };

      return tx
    }
  }
}
