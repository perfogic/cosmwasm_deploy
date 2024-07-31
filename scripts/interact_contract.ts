import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { InstantiateMsg } from "../bindings/TonbridgeBridge.types";
import { OraichainConfig, WasmLocalConfig } from "./networks";
import { Cw20Coin } from "../bindings/Cw20.types";
import { TokenfactoryClient, TonbridgeBridgeClient } from "../bindings";
import { coin } from "@cosmjs/stargate";

const contracts: Contract[] = [
  // {
  //   name: "cw20_base",
  //   wasmFile: "./contracts/cw20-base.wasm",
  // },
  // {
  //   name: "cw_bitcoin",
  //   wasmFile: "./contracts/cw-bitcoin.wasm",
  // },
  // {
  //   name: "token_factory",
  //   wasmFile: "./contracts/tokenfactory.wasm",
  // },
  {
    name: "cw_bridge_adapter",
    wasmFile: "./contracts/cw-tonbridge-bridge.wasm",
  },
];

// token factory: orai14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9savsjyw
// bridge adapter: orai1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrq3e4sxg
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);
  console.log(address);
  console.log(await client.getBalance(address, "orai"));

  // factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton
  const tx = await client.sendTokens(
    address,
    "orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2",
    [
      {
        amount: "100000",
        denom:
          "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/ton",
      },
    ],
    "auto",
    "Bắn tí tiền cho anh Toản"
  );
  console.log(tx.transactionHash);

  // const contract = new TonbridgeBridgeClient(
  //   client,
  //   address,
  //   "orai1f8yer2astssamnyzzp6yvk6q5h49kzj2gu0n7rct8uj38pswy7lqwa8mdw"
  // );

  // const tokenFactory = new TokenfactoryClient(
  //   client,
  //   address,
  //   "orai1eyfccmjm6732k7wp4p6gdjwhxjwsvje44j0hfx8nkgrm8fs7vqfswre2gu"
  // );
  // console.log(await contract.ackCommitment({ seq: 9 }));

  // const tx = await tokenFactory.createDenom(
  //   {
  //     subdenom: "lama",
  //   },
  //   {
  //     amount: [{ amount: "10000", denom: "orai" }],
  //     gas: "10000000",
  //   },
  //   "ok mate",
  //   [coin(10000000, "orai")]
  // );
  // console.log(tx.transactionHash);

  // console.log(await tokenFactory.denomsByCreator({ creator: address }));
  // const data = await contract.registerDenom(
  //   {
  //     subdenom: "ton",
  //   },
  //   {
  //     amount: [{ amount: "10000", denom: "orai" }],
  //     gas: "10000000",
  //   },
  //   "ok mate",
  //   [coin(10000000, "orai")]
  // );

  // console.log(data.transactionHash);
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
