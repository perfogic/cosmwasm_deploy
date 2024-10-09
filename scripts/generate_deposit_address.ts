import { generateDepositAddress } from "@oraichain/bitcoin-bridge-lib-js";

const main = async () => {
  const result = await generateDepositAddress({
    dest: {
      address: "orai1kcppeg78s6fmyjsw5rjvh06f9jm2uhpdnckzw8",
    },
    relayers: ["http://127.0.0.1:8000"],
    network: "testnet",
  });

  if (result.code == 0) {
    console.log(result.bitcoinAddress);
  }
};

main();
