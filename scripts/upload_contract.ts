import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { InstantiateMsg } from "../bindings/CwBitcoin.types";
import { WasmLocalConfig } from "./networks";
import { Cw20Coin } from "../bindings/Cw20.types";

const contracts: Contract[] = [
  {
    name: "cw20_base",
    wasmFile: "./contracts/cw20-base.wasm",
  },
  {
    name: "cw_bitcoin",
    wasmFile: "./contracts/cw-bitcoin.wasm",
  },
];

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, WasmLocalConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    cw20Base: codeId.cw20_base,
    cwBitcoin: codeId.cw_bitcoin,
  };

  const initMsg: InstantiateMsg = {
    token_factory_addr: address,
  };

  // const initial_balances: Cw20Coin[] = [{ address, amount: "1000000000" }];
  // const initMsg = {
  //   name: "Test Token",
  //   symbol: "TTOKEN",
  //   decimals: 6,
  //   initial_balances,
  //   mint: {
  //     minter: address,
  //   },
  // };

  const info = await client.instantiate(
    address,
    contractId.cwBitcoin,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    initMsg,
    "Test Token 1.0",
    "auto",
    {
      admin: address,
    }
  );

  console.log(info.contractAddress);
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
