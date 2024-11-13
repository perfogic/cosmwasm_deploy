import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { InstantiateMsg } from "../../bindings/CwBitcoin.types";
import { OraichainConfig, WasmLocalConfig } from "../constants/networks";
import { Cw20Coin } from "../../bindings/Cw20.types";

const contracts: Contract[] = [
  {
    name: "refund_btc",
    wasmFile: "./contracts/refund-btc.wasm",
  },
];

// token factory: orai1q62nnhyzv62re8rs85k666whax0eg0y5m224uwsmsvqnykxwtwwsqnjwcd
// bridge adapter: orai1a4cqpkh67ulh6447u0kuquucnn9jgk603wepu57yufdqe3f8hxmqr0wncz
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);

  const tx = await client.instantiate(
    address,
    codeId.refund_btc,
    {},
    "",
    "auto"
  );
  console.log(tx.transactionHash);
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
