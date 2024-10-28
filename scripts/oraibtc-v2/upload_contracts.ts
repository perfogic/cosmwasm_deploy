import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { InstantiateMsg as AppInstantiateMsg } from "../../bindings/AppBitcoin.types";
import { InstantiateMsg as LightClientInstantiateMsg } from "../../bindings/LightClientBitcoin.types";
import { InstantiateMsg as TfInstantiateMsg } from "../../bindings/Tokenfactory.types";
import { OraichainConfig, WasmLocalConfig } from "../constants/networks";

// cw bitcoin mainnet: orai18ffp5mu06pg55q9lj5hgkadtzadwfye4jl2pgfskuca84w7dcqjsezlqk2
const contracts: Contract[] = [
  // {
  //   name: "cw_light_client_bitcoin",
  //   wasmFile: "./contracts/cw-light-client-bitcoin.wasm",
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

// Light client bitcoin: orai1unyuj8qnmygvzuex3dwmg9yzt9alhvyeat0uu0jedg2wj33efl5qjs222y
// App bitcoin: orai1xt4ahzz2x8hpkc0tk6ekte9x6crw4w6u0r67cyt3kz9syh24pd7sxfqs0x
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    // tokenFactory: codeId.token_factory,
    // cwLightClientBitcoin: codeId.cw_light_client_bitcoin,
    cwAppBitcoin: codeId.cw_app_bitcoin,
  };
  console.log({ contractId });

  // const tokenFactoryMsg: TfInstantiateMsg = {};
  // const tokenFactoryContract = await client.instantiate(
  //   address,
  //   contractId.tokenFactory,
  //   tokenFactoryMsg,
  //   "bitcoin app contract",
  //   "auto",
  //   {
  //     admin: address,
  //   }
  // );

  // const lightClientMsg: LightClientInstantiateMsg = {};
  // const lightClientContract = await client.instantiate(
  //   address,
  //   contractId.cwLightClientBitcoin,
  //   lightClientMsg,
  //   "bitcoin light client contract",
  //   "auto",
  //   {
  //     admin: address,
  //   }
  // );

  // const appMsg: AppInstantiateMsg = {
  //   light_client_contract: lightClientContract.contractAddress,
  //   token_factory_contract: tokenFactoryContract.contractAddress,
  //   relayer_fee: "0",
  //   relayer_fee_receiver: "orai1yzmjgpr08u7d9n9qqhvux9ckfgq32z77c04lkg",
  //   relayer_fee_token: {
  //     native_token: {
  //       denom: "orai",
  //     },
  //   },
  //   token_fee_receiver: "orai1yzmjgpr08u7d9n9qqhvux9ckfgq32z77c04lkg",
  //   osor_entry_point_contract: "orai1yzmjgpr08u7d9n9qqhvux9ckfgq32z77c04lkg",
  // };

  // const appContract = await client.instantiate(
  //   address,
  //   contractId.cwAppBitcoin,
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   appMsg,
  //   "bitcoin app contract",
  //   "auto",
  //   {
  //     admin: address,
  //   }
  // );

  // console.log("Light client bitcoin:", lightClientContract.contractAddress);
  // console.log("App bitcoin:", appContract.contractAddress);
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
