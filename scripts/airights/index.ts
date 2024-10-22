import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { OraichainTestnetConfig } from "../constants/networks";

// cw bitcoin mainnet: orai18ffp5mu06pg55q9lj5hgkadtzadwfye4jl2pgfskuca84w7dcqjsezlqk2
const contracts: Contract[] = [
  {
    name: "oraichain_nft",
    wasmFile: "./contracts/oraichain_nft.wasm",
  },
];

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainTestnetConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    oraichainNft: codeId.oraichain_nft,
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
