import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  fromBinaryTransaction,
  getBitcoinTransactionTxid,
} from "@oraichain/bitcoin-bridge-wasm-sdk";
import fs from "fs";

const RPC = "http://3.14.142.99:26657";
const start = async () => {
  const cosmwasm = await CosmWasmClient.connect(RPC);
  cosmwasm.setQueryClientWithHeight(37076648);
  // let tx = fromBinaryTransaction(
  //   Buffer.from(
  //     "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",
  //     "base64"
  //   )
  // );
  // console.log(getBitcoinTransactionTxid(tx));
  // console.log({ tx });

  const data = await cosmwasm.queryContractSmart(
    "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
    {
      checkpoint_by_index: {
        index: 13,
      },
    }
  );

  // const cp = await cosmwasm.queryContractSmart(
  //   "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
  //   {
  //     checkpoint_by_index: {
  //       index: 13,
  //     },
  //   }
  // );
  // console.dir({ cp }, { depth: null });
  // console.log(cp);
  // const data = (await cosmwasm.queryContractRaw(
  //   "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
  //   new Uint8Array(Buffer.from("first_unhandled_confirmed_index"))
  // )) as Buffer;
  // console.log(Buffer.from(data).toString("utf-8"));
  // let addrs = [
  //   "orai1qv5jn7tueeqw7xqdn5rem7s09n7zletrsnc5vq",
  //   "orai1q53ujvvrcd0t543dsh5445lu6ar0qr2z9ll7ux",
  //   "orai1ltr3sx9vm9hq4ueajvs7ng24gw3k8t9t67y73h"
  // ];
  // let arr = [];
  // for (let i = 0; i <= addrs.length - 1; i++) {
  //   const data = await cosmwasm.queryContractSmart(
  //     "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
  //     {
  //       signatory_key: {
  //         addr: addrs[i]
  //       }
  //     }
  //   );
  //   console.dir(data, { depth: null });
  //   arr = [...arr, data];
  // }

  let arr: any[] = [];
  let overrideCheckpointsIndex = [13, 14, 19];
  for (let i = 0; i < overrideCheckpointsIndex.length; i++) {
    const data = await cosmwasm.queryContractSmart(
      "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
      {
        checkpoint_by_index: {
          index: overrideCheckpointsIndex[i],
        },
      }
    );
    arr = [...arr, data];
  }
  fs.writeFileSync(
    "scripts/oraibtc-v2/debug/checkpoint.json",
    JSON.stringify(arr)
  );
};

start();
