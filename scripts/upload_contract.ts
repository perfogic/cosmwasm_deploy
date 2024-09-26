import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { InstantiateMsg as AppInstantiateMsg } from "../bindings/AppBitcoin.types";
import { InstantiateMsg as LightClientInstantiateMsg } from "../bindings/LightClientBitcoin.types";
import { InstantiateMsg as TfInstantiateMsg } from "../bindings/Tokenfactory.types";
import { OraichainConfig, WasmLocalConfig } from "./networks";

// cw bitcoin mainnet: orai18ffp5mu06pg55q9lj5hgkadtzadwfye4jl2pgfskuca84w7dcqjsezlqk2
const contracts: Contract[] = [
  {
    name: "cw_light_client_bitcoin",
    wasmFile: "./contracts/cw-light-client-bitcoin.wasm",
  },
  {
    name: "cw_app_bitcoin",
    wasmFile: "./contracts/cw-app-bitcoin.wasm",
  },
  {
    name: "token_factory",
    wasmFile: "./contracts/tokenfactory.wasm",
  },
];

// Light client bitcoin: orai1hntfu45etpkdf8prq6p6la9tsnk3u3muf5378kds73c7xd4qdzys48gaav
// App bitcoin: orai14haqsatfqxh3jgzn6u7ggnece4vhv0nt8a8ml4rg29mln9hdjfdqgffekn
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, WasmLocalConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    tokenFactory: codeId.token_factory,
    cwLightClientBitcoin: codeId.cw_light_client_bitcoin,
    cwAppBitcoin: codeId.cw_app_bitcoin,
  };

  const tokenFactoryMsg: TfInstantiateMsg = {};
  const tokenFactoryContract = await client.instantiate(
    address,
    contractId.tokenFactory,
    tokenFactoryMsg,
    "bitcoin app contract",
    "auto",
    {
      admin: address,
    }
  );

  const lightClientMsg: LightClientInstantiateMsg = {};
  const lightClientContract = await client.instantiate(
    address,
    contractId.cwLightClientBitcoin,
    lightClientMsg,
    "bitcoin light client contract",
    "auto",
    {
      admin: address,
    }
  );

  const appMsg: AppInstantiateMsg = {
    light_client_contract: lightClientContract.contractAddress,
    token_factory_contract: tokenFactoryContract.contractAddress,
    relayer_fee: "0",
    relayer_fee_receiver: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
    relayer_fee_token: {
      native_token: {
        denom: "orai",
      },
    },
    token_fee_receiver: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
    osor_entry_point_contract:
      "orai14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9savsjyw",
  };

  const appContract = await client.instantiate(
    address,
    contractId.cwAppBitcoin,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    appMsg,
    "bitcoin app contract",
    "auto",
    {
      admin: address,
    }
  );

  console.log("Light client bitcoin:", lightClientContract.contractAddress);
  console.log("App bitcoin:", appContract.contractAddress);
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
