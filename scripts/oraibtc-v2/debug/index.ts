import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import fs from "fs";

const RPC = "http://3.14.142.99:26657";
const start = async () => {
  const cosmwasm = await CosmWasmClient.connect(RPC);
  cosmwasm.setQueryClientWithHeight(36975367);
  // const cp = await cosmwasm.queryContractSmart(
  //   "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
  //   {
  //     checkpoint_by_index: {
  //       index: 13,
  //     },
  //   }
  // );
  // console.log({ cp });
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
