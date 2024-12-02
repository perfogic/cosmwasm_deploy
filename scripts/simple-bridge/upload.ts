import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { InstantiateMsg } from "../../bindings/SimpleBridge.types";
import { OraichainConfig, WasmLocalConfig } from "../constants/networks";
import { SimpleBridgeInterface } from "../../bindings";

const contracts: Contract[] = [
  {
    name: "simple_bridge",
    wasmFile: "./contracts/simple-bridge.wasm",
  },
];

// Light client bitcoin: orai1unyuj8qnmygvzuex3dwmg9yzt9alhvyeat0uu0jedg2wj33efl5qjs222y
// App bitcoin: orai1xt4ahzz2x8hpkc0tk6ekte9x6crw4w6u0r67cyt3kz9syh24pd7sxfqs0x
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);
  console.log(address);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    simpleBridge: codeId.simple_bridge,
  };

  const tx = await client.migrate(
    address,
    "orai1tz9x4fe8mvs0zj99jnadkge5j7qqhy9478guwty8e80vzygwd6hq9f5d9l",
    contractId.simpleBridge,
    {},
    "auto"
  );
  console.log(`Migrate at tx ${tx.transactionHash}`);

  // const simpleBridgeMsg: InstantiateMsg = {
  //   token_factory_addr:
  //     "orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9",
  // };

  // const simpleBridgeContract = await client.instantiate(
  //   address,
  //   contractId.simpleBridge,
  //   simpleBridgeMsg,
  //   "simple bridge contract",
  //   "auto",
  //   {
  //     admin: address,
  //   }
  // );

  // console.log(simpleBridgeContract.contractAddress);
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