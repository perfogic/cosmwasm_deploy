import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { OraichainConfig } from "../constants/networks";

// cw bitcoin mainnet: orai18ffp5mu06pg55q9lj5hgkadtzadwfye4jl2pgfskuca84w7dcqjsezlqk2
const contracts: Contract[] = [
  // {
  //   name: "oraichain_nft",
  //   wasmFile: "./contracts/oraichain_nft.wasm",
  // },
  // {
  //   name: "marketplace",
  //   wasmFile: "./contracts/marketplace.wasm",
  // },
  // {
  //   name: "locked_ow721",
  //   wasmFile: "./contracts/locked_ow721.wasm",
  // },
  // {
  //   name: "auction_nft",
  //   wasmFile: "./contracts/auction_nft.wasm",
  // },
  // {
  //   name: "market_hub",
  //   wasmFile: "./contracts/market_hub.wasm",
  // },
  // {
  //   name: "market_offering_storage",
  //   wasmFile: "./contracts/market_offering_storage.wasm",
  // },
  // {
  //   name: "market_ai_royalty_storage",
  //   wasmFile: "./contracts/market_ai_royalty_storage.wasm",
  // },
  {
    name: "market_nft_staking",
    wasmFile: "./contracts/market_nft_staking.wasm",
  },
  // {
  //   name: "market_payment_storage",
  //   wasmFile: "./contracts/market_payment_storage.wasm",
  // },
  // {
  //   name: "market_1155_implementation",
  //   wasmFile: "./contracts/market_1155_implementation.wasm",
  // },
  // {
  //   name: "market_implementation",
  //   wasmFile: "./contracts/market_implementation.wasm",
  // },
  // {
  //   name: "market_whitelist_storage",
  //   wasmFile: "./contracts/market_whitelist_storage.wasm",
  // },
];

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  // upload contract
  const codeId = await uploadContracts(
    client,
    address,
    contracts,
    "e20015e9c51ac7d100bd57c0387a71c3332df0cb"
  );
  console.log(codeId);
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
