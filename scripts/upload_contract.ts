import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { InstantiateMsg } from "../bindings/CwBitcoin.types";
import { OraichainConfig, WasmLocalConfig } from "./networks";
import { Cw20Coin } from "../bindings/Cw20.types";

const contracts: Contract[] = [
  {
    name: "cw_bitcoin",
    wasmFile: "./contracts/cw-bitcoin.wasm",
  },
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
    cwBitcoin: codeId.cw_bitcoin,
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
    token_factory_addr:
      "orai17hyr3eg92fv34fdnkend48scu32hn26gqxw3hnwkfy904lk9r09qqzty42",
    relayer_fee: "0",
    relayer_fee_receiver: "orai1rchnkdpsxzhquu63y6r4j4t57pnc9w8ehdhedx",
    relayer_fee_token: {
      native_token: {
        denom: "orai",
      },
    },
    token_fee_receiver: "orai1rchnkdpsxzhquu63y6r4j4t57pnc9w8ehdhedx",
    osor_entry_point_contract:
      "orai1yglsm0u2x3xmct9kq3lxa654cshaxj9j5d9rw5enemkkkdjgzj7sr3gwt0",
  };

  const info = await client.instantiate(
    address,
    contractId.cwBitcoin,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    initMsg,
    "cw bitcoin test",
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
