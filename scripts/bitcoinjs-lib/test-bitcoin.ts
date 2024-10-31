import * as btc from "bitcoinjs-lib";
import { BitcoinNetwork, redeemScript } from "@oraichain/bitcoin-bridge-lib-js";
import {
  commitmentBytes,
  encodeXpub,
} from "@oraichain/bitcoin-bridge-wasm-sdk";
import * as dogecoin from "@unielon/coin-dogecoin";
import BIP32Factory from "bip32";
import crypto from "crypto";
import * as ecc from "tiny-secp256k1";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";
import { broadcast } from "./blockstream_utils";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

function isRedeemScriptValidSize(script: string): boolean {
  const scriptBuffer = Buffer.from(script, "hex");
  return scriptBuffer.length <= 520;
}

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

  let dest = commitmentBytes({
    Address: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
  });
  let depositScript = redeemScript(
    {
      create_time: 1730103775,
      index: 10,
      possible_vp: 2000,
      present_vp: 2000,
      signatories: allPubkeys.map((pubkey) => {
        return {
          pubkey: {
            bytes: pubkey,
          },
          voting_power: 20,
        };
      }),
    },
    Buffer.from(dest),
    [2, 3]
  );

  const p2wsh = dogecoin.payments.p2wsh({
    redeem: { output: depositScript, network: network },
    network: network,
  });
  const p2wshInP2sh = dogecoin.payments.p2sh({
    redeem: p2wsh,
    network: network,
  });
  console.log(p2wshInP2sh.name);
  console.log("Address:", p2wshInP2sh.address);
  //   let script = dogecoin.payments.p2sh({
  //     redeem: dogecoin.payments.p2wsh({
  //       output: depositScript,
  //     }),
  //     network,
  //   });
  //   console.log("Address:", script.address);

  const psbt = new btc.Psbt({
    network,
  });
  psbt.addInput({
    hash: "47dc6bfc9d9dfb1243b6177e5f28b699a5fff71ee520aa36d89e4217767d7f41",
    index: 0,
    nonWitnessUtxo: Buffer.from(
      "01000000012f30c637bd7cb8fa001c1a8c2874620d0bcdbc4bc3e9d1efdfc94aa8a3a03b44010000006b483045022100bf69df145f401e22996e174eda1a728aedaa7f600d62bee485b0070a5abbe5d6022016e8bd0bb18e9634ab0d4f9bfc36c7616c39dc5a9506e4752e612b30ea3996d5012102a8949a24e181983f8f567595b09207cee1b34aa288119d30888989de236611edffffffff0280c3c9010000000017a9140461ba587558f60e641b71046d90d0af8e6f5ad68760129502000000001976a914b234ff71ba9b849964ebc5ddb5e1676da1ad5de188ac00000000",
      "hex"
    ),
    redeemScript: p2wshInP2sh.output!, // P2SH wrapper
    witnessUtxo: {
      script: p2wsh.output!, // P2WSH script
      value: 100000,
    },
    witnessScript: p2wsh.output!, // P2WSH script
  });

  // Sign the input
  allNodes.forEach((item) => {
    psbt.signInput(0, item).finalizeInput(0);
  });

  // Finalize with a custom finalizer
  //   psbt.finalizeInput(0, (inputIndex: any, psbtInput: any) => {
  //     const witnessSignatures = psbtInput.partialSig.map(
  //       (item: any) => item.signature
  //     );
  //     const redeemPayment = btc.payments.p2wsh({
  //       redeem: {
  //         input: btc.script.compile(witnessSignatures.reverse()), // Use correct order of signatures
  //         output: psbtInput.witnessScript,
  //       },
  //     });

  //     const finalScriptWitness = witnessStackToScriptWitness(
  //       redeemPayment.witness ?? []
  //     );

  //     return {
  //       finalScriptSig: Buffer.from(""), // Empty for P2WSH
  //       finalScriptWitness: finalScriptWitness,
  //     };
  //   });
  //   const tx = psbt.extractTransaction(true);
  //   console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  //   const txid = await broadcast(tx.toHex());
  //   console.log(Success! Txid is ${txid});
};

main();
