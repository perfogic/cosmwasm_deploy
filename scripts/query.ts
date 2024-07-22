import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { WasmLocalConfig } from "./networks";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, WasmLocalConfig);

  console.log(
    await client.getTx(
      "7DB7EAFDFB577E71D31D8224B0538E3A9C53BFB8009AD5CEE1749C75AA065AC0"
    )
  );
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
