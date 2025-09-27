import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

import { configVariable } from "hardhat/config";
import { flowTestnet } from "viem/chains";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, hardhatEthers],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    flowTestnet: {
      type: "http",
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: [configVariable("FLOW_PRIVATE_KEY")],
      chainId: 545,
    },
  },
};

export default config;
