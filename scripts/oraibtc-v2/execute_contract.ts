import { getMnemonic } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { OraichainConfig, OraiBtcLocalConfig } from "../constants/networks";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { coin } from "@cosmjs/stargate";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(mnemonic, OraichainConfig, true);

  const tx = client.sendTokens(
    address,
    "orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2",
    [
      coin(
        8450000,
        "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc"
      ),
    ],
    "auto",
    ""
  );

  console.log((await tx).transactionHash);
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
