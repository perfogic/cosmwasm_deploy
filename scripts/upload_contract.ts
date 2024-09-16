import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { InstantiateMsg } from "../bindings/AppBitcoin.types";
import { OraichainConfig, WasmLocalConfig } from "./networks";
import { Cw20Coin } from "../bindings/Cw20.types";

// cw bitcoin mainnet: orai18ffp5mu06pg55q9lj5hgkadtzadwfye4jl2pgfskuca84w7dcqjsezlqk2
const contracts: Contract[] = [
  // {
  //   name: "cw_bitcoin",
  //   wasmFile: "./contracts/cw-bitcoin.wasm",
  // },
  {
    name: "cw_app_bitcoin",
    wasmFile: "./contracts/cw-app-bitcoin.wasm",
  },
  // {
  //   name: "proxy_bitcoin",
  //   wasmFile: "./contracts/proxy-bitcoin.wasm",
  // },
  // {
  //   name: "read_write_state",
  //   wasmFile: "./contracts/read-write-state.wasm",
  // },
  // {
  //   name: "token_factory",
  //   wasmFile: "./contracts/tokenfactory.wasm",
  // },
];

// token factory: orai1hsnyup3wwxwzk6pyquzzgjjwyw2hn0mqzmc73khkuxxfsau5zskqykrq0z
// bridge contract: orai12ykmayptxjn9qjyq45qlhv7sc8pl6hxqccrtsledngutnlfh9nssyw03xr
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    // tokenFactory: codeId.token_factory,
    // cwBitcoin: codeId.cw_bitcoin,
    // proxyBitcoin: codeId.proxy_bitcoin,
    // readWriteState: codeId.read_write_state,
    cwAppBitcoin: codeId.cw_app_bitcoin,
  };

  // const info0 = await client.instantiate(
  //   address,
  //   contractId.tokenFactory,
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   {},
  //   "token factory test",
  //   "auto",
  //   {
  //     admin: address,
  //   }
  // );
  // console.log(info0.contractAddress);

  const initMsg: InstantiateMsg = {
    light_client_contract:
      "orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9",
    token_factory_contract:
      "orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9",
    relayer_fee: "0",
    relayer_fee_receiver: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
    relayer_fee_token: {
      native_token: {
        denom: "orai",
      },
    },
    token_fee_receiver: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
    osor_entry_point_contract:
      "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
  };

  const info = await client.instantiate(
    address,
    contractId.cwAppBitcoin,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    initMsg,
    "bitcoin app contract",
    "auto",
    {
      admin: address,
    }
  );

  // const info = await client.instantiate(
  //   address,
  //   contractId.readWriteState,
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   {
  //     count: 0,
  //   },
  //   "read write state test",
  //   "auto",
  //   {
  //     admin: address,
  //   }
  // );

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
