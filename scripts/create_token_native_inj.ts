import { getMnemonic } from "./helpers/utils";
import { connectINJ } from "./helpers/connect";
import { Network, getNetworkInfo } from "@injectivelabs/networks";

import {
  MsgCreateDenom,
  MsgSetDenomMetadata,
  MsgMint,
} from "@injectivelabs/sdk-ts";
import { executeTransaction } from "./helpers/contract";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { privateKey, address } = await connectINJ(mnemonic);

  const network = getNetworkInfo(Network.TestnetSentry);

  const tokenDeployConfigDenom = "first-token";
  const tokenDeployConfig = {
    description: "First Token Description",
    denomUnits: [
      {
        denom: `factory/${address}/${tokenDeployConfigDenom}`,
        exponent: 0,
        aliases: [],
      },
      { denom: "MFT", exponent: 6, aliases: [] },
    ],
    display: "MFT", // Suggest denom displayed on client
    name: "My First Token",
    symbol: "MFT",
    uri: "",
    uriHash: "",
    initialSupply: "1000000",
  };

  const createDenomMsg = MsgCreateDenom.fromJSON({
    sender: address,
    subdenom: tokenDeployConfigDenom,
  });

  const setDenomMetadataMsg = MsgSetDenomMetadata.fromJSON({
    sender: address,
    metadata: {
      description: tokenDeployConfig.description,
      base: `factory/${address}/${tokenDeployConfigDenom}`,
      denomUnits: tokenDeployConfig.denomUnits,
      display: tokenDeployConfig.display,
      name: tokenDeployConfig.name,
      symbol: tokenDeployConfig.symbol,
      uri: tokenDeployConfig.uri || "",
      uriHash: tokenDeployConfig.uriHash,
    },
  });

  const mintTokenMsg = MsgMint.fromJSON({
    sender: address,
    amount: {
      denom: `factory/${address}/${tokenDeployConfigDenom}`,
      amount: tokenDeployConfig.initialSupply,
    },
  });

  await executeTransaction(privateKey, network, [
    createDenomMsg,
    setDenomMetadataMsg,
    mintTokenMsg,
  ]);
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
