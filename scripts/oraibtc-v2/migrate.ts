import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { InstantiateMsg } from "../../bindings/CwBitcoin.types";
import { OraichainConfig, WasmLocalConfig } from "../constants/networks";
import { Cw20Coin } from "../../bindings/Cw20.types";

const contracts: Contract[] = [
  // {
  //   name: "cw20_base",
  //   wasmFile: "./contracts/cw20-base.wasm",
  // },
  // {
  //   name: "cw_bridge_adapter",
  //   wasmFile: "./contracts/cw-tonbridge-bridge.wasm",
  // },
  // {
  //   name: "cw_bitcoin",
  //   wasmFile: "./contracts/cw-bitcoin.wasm",
  // },
  {
    name: "cw_app_bitcoin",
    wasmFile: "./contracts/cw-app-bitcoin.wasm",
  },
  // {
  //   name: "token_factory",
  //   wasmFile: "./contracts/tokenfactory.wasm",
  // },
];

// token factory: orai1q62nnhyzv62re8rs85k666whax0eg0y5m224uwsmsvqnykxwtwwsqnjwcd
// bridge adapter: orai1a4cqpkh67ulh6447u0kuquucnn9jgk603wepu57yufdqe3f8hxmqr0wncz
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, WasmLocalConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    // cwBitcoin: codeId.cw_bitcoin,
    cwBitcoinApp: codeId.cw_app_bitcoin,
  };

  const tx = await client.migrate(
    address,
    "orai14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9savsjyw",
    contractId.cwBitcoinApp,
    {},
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
