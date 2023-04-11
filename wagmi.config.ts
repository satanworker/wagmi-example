import { defineConfig } from "@wagmi/cli";
import { CounterABI } from "./src/web3/abi/counterABI";
import { actions } from '@wagmi/cli/plugins'


export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "Counter",
      address: {},
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
