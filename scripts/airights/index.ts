import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { OraichainTestnetConfig } from "../constants/networks";

// cw bitcoin mainnet: orai18ffp5mu06pg55q9lj5hgkadtzadwfye4jl2pgfskuca84w7dcqjsezlqk2
const contracts: Contract[] = [
  // {
  //   name: "oraichain_nft",
  //   wasmFile: "./contracts/oraichain_nft.wasm",
  // },
  {
    name: "marketplace",
    wasmFile: "./contracts/marketplace.wasm",
  },
  // {
  //   name: "locked_ow721",
  //   wasmFile: "./contracts/locked_ow721.wasm",
  // },
  // {
  //   name: "market_nft_staking",
  //   wasmFile: "./contracts/market_nft_staking.wasm",
  // },
  // {
  //   name: "market_payment_storage",
  //   wasmFile: "./contracts/market_payment_storage.wasm",
  // },
];

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainTestnetConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    marketplace: codeId.marketplace,
  };
  console.log(contractId);
}

main().then(
  () => {
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
