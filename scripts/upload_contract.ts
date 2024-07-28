import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { InstantiateMsg } from "../bindings/TonbridgeBridge.types";
import { OraichainConfig, WasmLocalConfig } from "./networks";
import { Cw20Coin } from "../bindings/Cw20.types";
import { toAssetInfo } from "@oraichain/oraidex-common";

const contracts: Contract[] = [
  // {
  //   name: "cw20_base",
  //   wasmFile: "./contracts/cw20-base.wasm",
  // },
  // {
  //   name: "cw_bitcoin",
  //   wasmFile: "./contracts/cw-bitcoin.wasm",
  // },
  {
    name: "token_factory",
    wasmFile: "./contracts/tokenfactory.wasm",
  },
  {
    name: "cw_bridge_adapter",
    wasmFile: "./contracts/cw-tonbridge-bridge.wasm",
  },
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
    tokenFactory: codeId.token_factory,
    bridgeAdapter: codeId.cw_bridge_adapter,
  };

  const info0 = await client.instantiate(
    address,
    contractId.tokenFactory,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {},
    "token factory test",
    "auto",
    {
      admin: address,
    }
  );
  console.log(info0.contractAddress);

  const initMsg: InstantiateMsg = {
    bridge_adapter:
      "orai1q62nnhyzv62re8rs85k666whax0eg0y5m224uwsmsvqnykxwtwwsqnjwcd",
    relayer_fee_receiver:
      "orai1q62nnhyzv62re8rs85k666whax0eg0y5m224uwsmsvqnykxwtwwsqnjwcd",
    relayer_fee_token: {
      native_token: {
        denom: "orai",
      },
    },
    swap_router_contract:
      "orai1q62nnhyzv62re8rs85k666whax0eg0y5m224uwsmsvqnykxwtwwsqnjwcd",
    token_fee_receiver:
      "orai1q62nnhyzv62re8rs85k666whax0eg0y5m224uwsmsvqnykxwtwwsqnjwcd",
    validator_contract_addr:
      "orai1q62nnhyzv62re8rs85k666whax0eg0y5m224uwsmsvqnykxwtwwsqnjwcd",
    token_factory_addr: info0.contractAddress,
  };

  const info = await client.instantiate(
    address,
    contractId.bridgeAdapter,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    initMsg,
    "bridge adapter test",
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
