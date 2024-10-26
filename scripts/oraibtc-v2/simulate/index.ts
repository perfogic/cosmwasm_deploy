import { SimulateCosmWasmClient } from "@oraichain/cw-simulate";
import {
  downloadState,
  downloadWasmStateIfNotExist,
  loadCodeAndState,
} from "../../helpers/simulate";
import { resolve } from "path";
import { readFileSync } from "fs";
import { AppBitcoinClient } from "./contracts-sdk";

const SENDER = "orai1yzmjgpr08u7d9n9qqhvux9ckfgq32z77c04lkg";
const CW_BITCOIN_CONTRACT =
  "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz";
const CW_LIGHT_CLIENT =
  "orai1rdykz2uuepxhkarar8ql5ajj5j37pq8h8d4zarvgx2s8pg0af37qucldna";

const main = async () => {
  const simulateClient = new SimulateCosmWasmClient({
    chainId: "oraichain",
    bech32Prefix: "orai",
    metering: true,
  });
  await downloadWasmStateIfNotExist(__dirname, CW_BITCOIN_CONTRACT)();
  await downloadWasmStateIfNotExist(__dirname, CW_LIGHT_CLIENT)();
  await loadCodeAndState(
    simulateClient,
    CW_BITCOIN_CONTRACT,
    resolve(__dirname, `./data/${CW_BITCOIN_CONTRACT}`),
    {
      codeId: 0,
      creator: SENDER,
      admin: SENDER,
      label: "",
      created: 0,
    }
  );
  await loadCodeAndState(
    simulateClient,
    CW_LIGHT_CLIENT,
    resolve(__dirname, `./data/${CW_LIGHT_CLIENT}`),
    {
      codeId: 1,
      creator: SENDER,
      admin: SENDER,
      label: "",
      created: 0,
    }
  );
  const cwAppBitcoin = new AppBitcoinClient(
    simulateClient as any,
    SENDER,
    CW_BITCOIN_CONTRACT
  );
  let beforeMigrateCheckpoints = [];
  for (let i = 6; i <= 19; i++) {
    let checkpoint = await cwAppBitcoin.checkpointByIndex({
      index: i,
    });
    if (i == 13 || i == 14) continue;
    beforeMigrateCheckpoints.push(checkpoint);
  }
  const newCode = readFileSync(
    resolve(__dirname, "./data/cw-app-bitcoin.wasm")
  ); // Note: this is code that comment the code for fetching validators below begin_block_step for not leading to any error
  const { codeId, transactionHash } = await simulateClient.upload(
    SENDER,
    new Uint8Array(newCode),
    "auto"
  );
  console.log("Upload successfully at", transactionHash, "with codeId", codeId);
  const txMigrate = await simulateClient.migrate(
    SENDER,
    CW_BITCOIN_CONTRACT,
    codeId,
    {},
    "auto"
  );
  console.log("Migrate successfully at", txMigrate.transactionHash);
  let afterMigrateCheckpoints = [];
  for (let i = 6; i <= 19; i++) {
    let checkpoint = await cwAppBitcoin.checkpointByIndex({
      index: i,
    });
    if (checkpoint.sigset.index != i) {
      throw new Error(`Checkpoint have wrong index at ${i}`);
    }
    if (
      (checkpoint.sigset.index <= 18 && checkpoint.status !== "complete") ||
      (checkpoint.sigset.index == 19 && checkpoint.status !== "building")
    ) {
      throw new Error(
        `Wrong checkpoint status at ${i} with status ${checkpoint.status}`
      );
    }
    if (i == 13 || i == 14) continue; // skip it because it has been mutated
    afterMigrateCheckpoints.push(checkpoint);
  }
  if (
    JSON.stringify(beforeMigrateCheckpoints) !=
    JSON.stringify(afterMigrateCheckpoints)
  ) {
    throw new Error("Before migrate data != After migrate data");
  }
  const hash = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  console.log(Buffer.from(hash, "hex").toString("base64"));
  const tx = await cwAppBitcoin.triggerBeginBlock({
    hash: Buffer.from(hash, "hex").toString("base64"),
  });
  console.log("Successfullly trigger block:", tx.transactionHash);
  let checkpoint = await cwAppBitcoin.checkpointByIndex({
    index: 19,
  });
  if (checkpoint.status !== "signing") {
    throw new Error("Checkpoint 19 should be signing");
  }
  checkpoint = await cwAppBitcoin.checkpointByIndex({
    index: 20,
  });
  if (checkpoint.status !== "building") {
    throw new Error("Checkpoint 20 should be building");
  }
};

main();
