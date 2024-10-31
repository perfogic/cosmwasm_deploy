import * as btc from "bitcoinjs-lib";
import { BitcoinNetwork, redeemScript } from "@oraichain/bitcoin-bridge-lib-js";
import {
  commitmentBytes,
  encodeXpub,
} from "@oraichain/bitcoin-bridge-wasm-sdk";
import * as dogecoin from "@unielon/coin-dogecoin";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";
import { broadcast } from "./blockstream_utils";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

function isRedeemScriptValidSize(script: string): boolean {
  const scriptBuffer = Buffer.from(script, "hex");
  return scriptBuffer.length <= 520;
}

export function bech32toScriptPubKey(a: string): Buffer {
  const z = btc.address.fromBech32(a);
  return btc.script.compile([
    btc.script.number.encode(z.version),
    btc.address.fromBech32(a).data,
  ]);
}

const main = async () => {
  let network = btc.networks.testnet;
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

  // const p2wsh = btc.payments.p2wsh({
  //   redeem: { output: redeem, network: network },
  //   network: network,
  // });
  // const p2wshInP2sh = btc.payments.p2sh({
  //   redeem: p2wsh,
  //   network: network,
  // });
  // console.log("Address:", p2wshInP2sh.address);

  let prevOutAmount = 1000000;
  let tx = new btc.Transaction();
  tx.addInput(
    Buffer.from(
      "5f78e1aba18015d00ebf799c971807142d672610d2e898c6c133669f33d5dc32",
      "hex"
    ).reverse(),
    0
  );
  tx.addOutput(
    bech32toScriptPubKey("tb1qewgfymc9ssrszh7dh202rtsgz3yjzvyyk77vzv"),
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

  const txid = await broadcast(tx.toHex());
  console.log(`Success! Txid is ${txid}`);
};

main();
