import * as btc from "bitcoinjs-lib";
import { BitcoinNetwork, redeemScript } from "@oraichain/bitcoin-bridge-lib-js";
import {
  commitmentBytes,
  encodeXpub,
} from "@oraichain/bitcoin-bridge-wasm-sdk";
import * as dogecoin from "@unielon/coin-dogecoin";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import { broadcast } from "./dogestream_utils";
import { readFileSync } from "fs";
import path from "path";
import { legacyToScriptPubKey } from "./utils";

const main = async () => {
  let network = dogecoin.dogeCoin;
  const bip32 = BIP32Factory(ecc);
  let allSeeds = (
    JSON.parse(
      readFileSync(path.join(__dirname, "seeds.json"), "utf8")
    ) as string[]
  ).map((item) => Buffer.from(item, "hex"));
  let allNodes = allSeeds.map((item: Buffer) => bip32.fromSeed(item, network));
  let allPubkeys = allNodes.map(
    (item) => item.neutered().publicKey.toJSON().data
  );
  let allPubkeysHex = allPubkeys.map((item: any) => {
    return Buffer.from(item).toString("hex");
  });

  let dest = commitmentBytes({
    Address: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
  });
  let redeem = redeemScript(
    {
      create_time: 1730103775,
      index: 0,
      possible_vp: 750,
      present_vp: 750,
      signatories: allPubkeys.map((pubkey) => {
        return {
          pubkey: {
            bytes: pubkey,
          },
          voting_power: 50,
        };
      }),
    },
    Buffer.from(dest),
    [2, 3]
  );

  const p2wsh = btc.payments.p2wsh({
    redeem: { output: redeem, network: network },
    network: network,
  });
  const p2wshInP2sh = btc.payments.p2sh({
    redeem: p2wsh,
    network: network,
  });
  console.log("Address:", p2wshInP2sh.address);
  console.log("Name:", p2wshInP2sh.name);

  let prevOutAmount = 20000000;
  let tx = new btc.Transaction();
  tx.addInput(
    Buffer.from(
      "1f075ffff61fe32f697ee2bbaf6072e345c98e625639b675ce6278cfc9d782f3",
      "hex"
    ).reverse(),
    0
  );
  tx.addOutput(
    legacyToScriptPubKey("DMPNJkv66MRTzcRdYgw2ZiPsY6G66kVWMo"),
    prevOutAmount - 1000
  );
  tx.setInputScript(
    0,
    btc.script.compile([
      Buffer.from("0020" + btc.crypto.sha256(redeem).toString("hex"), "hex"),
    ])
  );
  let hashForSignature = tx.hashForWitnessV0(
    0,
    redeem,
    prevOutAmount,
    btc.Transaction.SIGHASH_ALL
  );
  console.log("Hash", hashForSignature.toString("hex"));
  let ans = allNodes.map((node) => {
    let sig = btc.script.signature.encode(
      node.sign(hashForSignature),
      btc.Transaction.SIGHASH_ALL
    );
    return Buffer.from(sig);
  });
  tx.setWitness(0, [...ans.reverse(), redeem]);

  console.log(tx.toHex());
  const txid = await broadcast(tx.toHex());
  console.log(`Success! Txid is ${txid}`);
};

main();
