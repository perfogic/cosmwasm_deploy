import { connect } from "../helpers/connect";
import { getMnemonic } from "../helpers/utils";
import { OraichainTestnetConfig } from "../constants/networks";

const main = async () => {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainTestnetConfig);

  const tx = await client.sendTokens(
    address,
    "orai1v8r49hecvev8kskwjndskfymz5uk4e5c83xucu",
    [
      {
        amount: "2000000",
        denom: "orai",
      },
    ],
    "auto",
    ""
  );
  console.log(tx.transactionHash);
};

main();
