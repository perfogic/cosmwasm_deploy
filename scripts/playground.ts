import { connect } from "./helpers/connect";
import { getMnemonic } from "./helpers/utils";
import { OraichainConfig } from "./networks";

const main = async () => {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  const tx = await client.sendTokens(
    address,
    "orai1mycmhyrmd6dusp408rtjgzlk7738vhtgqyhxxt",
    [
      {
        amount: "100000000",
        denom: "orai",
      },
    ],
    "auto",
    ""
  );
  console.log(tx.transactionHash);
};

main();
