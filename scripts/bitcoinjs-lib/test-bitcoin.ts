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
  let allNodes = [allSeeds[0]].map((item: Buffer) =>
    bip32.fromSeed(item, network)
  );
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

  let tx = new btc.Transaction();
  tx.addInput(
    Buffer.from(
      "1145d6f1c02b977996e6b600a22a1a2d5a3c0e8ab4d964240e0f3038785e6003",
      "hex"
    ).reverse(),
    0
  );
  tx.addOutput(
    bech32toScriptPubKey("tb1qewgfymc9ssrszh7dh202rtsgz3yjzvyyk77vzv"),
    5000000 - 1000
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
    5000000,
    btc.Transaction.SIGHASH_ALL
  );
  console.log("Hash", hashForSignature.toString("hex"));
  let ans = allNodes.map((node) => {
    let sig = btc.script.signature.encode(
      allNodes[0].sign(hashForSignature),
      btc.Transaction.SIGHASH_ALL
    );
    return Buffer.from(sig);
  });
  tx.setWitness(0, [...ans.reverse(), redeem]);
  console.log(tx.toHex());

  //   const psbt = new btc.Psbt({
  //     network,
  //   });
  //   psbt.addInput({
  //     hash: "1145d6f1c02b977996e6b600a22a1a2d5a3c0e8ab4d964240e0f3038785e6003",
  //     index: 0,
  //     nonWitnessUtxo: Buffer.from(
  //       "020000000001015204aa75fb229b875f486593be2f58256a5f888549c21ce01be9a149f88230f50100000000fdffffff02404b4c000000000017a914db67eafc1f7b47ee27987e1efae792656ebadd0487c839ae0900000000160014d6407a800f29381c7b93794d7281abd8e2e4eab202473044022011e388b8130dde787b87bdf7db351c7eb9f1eefd1e2ee271bf656d457257f55b022062a601b9bf80d6bebbeefc7a2df3064f643e6a2cafaf6a6d2842219862ce238801210218979a5e22793a38db9d7e8581d28c3a695b157fb3dbeecb2818c7fbb5c53ae2c1c53000",
  //       "hex"
  //     ),
  //     redeemScript: p2wshInP2sh.redeem!.output!, // P2SH wrapper
  //     witnessScript: p2wshInP2sh.redeem!.redeem!.output!, // P2WSH script
  //   });
  //   psbt.addOutput({
  //     address: "tb1q80yacawds7fs9spcn7e6c050vprgu5e8lw83p5",
  //     value: 5000000 - 10000,
  //   });

  //   // Sign the input
  //   allNodes.forEach((item) => {
  //     psbt.signInput(0, item);
  //   });

  //   psbt.finalizeInput(0, (inputIndex: number, psbtInput: any) => {
  //     const redeemPayment = btc.payments.p2wsh({
  //       redeem: {
  //         input: btc.script.compile(
  //           psbtInput.partialSig.map((item: any) => item.signature).reverse()
  //         ), // Make sure to be putted in a correct orders
  //         output: psbtInput.witnessScript,
  //       },
  //     });
  //     const finalScriptWitness = witnessStackToScriptWitness(
  //       redeemPayment.witness ?? []
  //     );

  //     return {
  //       finalScriptSig: Buffer.from(""),
  //       finalScriptWitness: finalScriptWitness,
  //     };
  //   });

  //   const tx = psbt.extractTransaction(false);
  //   console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  const txid = await broadcast(tx.toHex());
  console.log(`Success! Txid is ${txid}`);
};

main();
