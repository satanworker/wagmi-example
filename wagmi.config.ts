import { defineConfig } from "@wagmi/cli";
import { CounterABI } from "./src/web3/abi/counterABI";
import { actions } from '@wagmi/cli/plugins'
import { goerli } from "@wagmi/core";

const COUNTER_ADDRESS_GOERELI = "0xfC5F404bEC816C6DC4F1ef4370C96bc5d0c561A9";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "Counter",
      address: {
        [goerli.id]: COUNTER_ADDRESS_GOERELI
      },
      abi: CounterABI,
    },
  ],
  plugins: [
    actions({
      readContract: true,
      writeContract: true,
    }),
  ],
});
