import { generateDepositAddress } from "@oraichain/bitcoin-bridge-lib-js";

const main = async () => {
  const result = await generateDepositAddress({
    dest: {
      ibc: {
        memo: "",
        receiver: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
        sender: "orai1rchnkdpsxzhquu63y6r4j4t57pnc9w8ehdhedx",
        source_channel: "channel-1",
        source_port: "transfer",
        timeout_timestamp: Number("1754004281050000000"),
      },
    },
    relayers: ["http://127.0.0.1:8000"],
    network: "testnet",
  });

  if (result.code == 0) {
    console.log(result.bitcoinAddress);
  }
};

main();
