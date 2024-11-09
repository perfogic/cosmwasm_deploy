import * as btc from "bitcoinjs-lib";
import { BitcoinNetwork, redeemScript } from "@oraichain/bitcoin-bridge-lib-js";
import {
  commitmentBytes,
  encodeXpub,
} from "@oraichain/bitcoin-bridge-wasm-sdk";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import { broadcast } from "./blockstream_utils";
import crypto from "crypto";
import { bech32toScriptPubKey, legacyToScriptPubKey } from "./utils";

const main = async () => {
  let network = btc.networks.testnet;
  const bip32 = BIP32Factory(ecc);
  let allSeeds = [
    "53c008c05f0a7b913c34779038eff44a6bb94b134adbc60433ea817ba93e555a",
    "5b6048d2c6c98c1a0bf57a347e09731bec04cab0b42407af30c13e47bd1137e4",
    "427d0828fef1e7b60dd4848d4e11bd8c4d69f40b62be0fa2f4e6880af8cf9185",
  ];
  let allNodes = allSeeds.map((item) =>
    bip32.fromSeed(Buffer.from(item, "hex"), network)
  );
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
      possible_vp: 201,
      present_vp: 201,
      signatories: [
        {
          pubkey: {
            bytes: allPubkeys[0],
          },
          voting_power: 100,
        },
        {
          pubkey: {
            bytes: allPubkeys[1],
          },
          voting_power: 100,
        },
        {
          pubkey: {
            bytes: allPubkeys[2],
          },
          voting_power: 80,
        },
      ],
    },
    Buffer.from(dest),
    [1, 3],
    "legacy",
    "debug"
  );
  let script = btc.payments.p2sh({
    redeem: { output: depositScript },
    network,
  });
  console.log("Address:", script.address);

  let prevOutAmount = 100000;
  let tx = new btc.Transaction();
  tx.addInput(
    Buffer.from(
      "1ee1ed0924f40b722c56901ea1d7b2113fadfc7c51a93ef1c06f842cb4b34c2c",
      "hex"
    ).reverse(),
    0
  );
  tx.addOutput(
    legacyToScriptPubKey("moTNmFSvb5EAXjhTNtfWnUjK5CEcdnnzrN"),
    prevOutAmount - 1000
  );

  let hashForSignature = tx.hashForSignature(
    0,
    depositScript,
    btc.Transaction.SIGHASH_ALL
  );
  let skippedIndex = [0, 2];
  let sigs = allNodes
    .map((node, index) => {
      if (skippedIndex.includes(index)) {
        return Buffer.from("");
      }
      let sig = btc.script.signature.encode(
        node.sign(hashForSignature),
        btc.Transaction.SIGHASH_ALL
      );
      return Buffer.from(btc.script.compile(sig));
    })
    .filter((item) => item);
  tx.setInputScript(0, btc.script.compile([...sigs.reverse(), depositScript]));
  console.log(tx.toHex());
  const txid = await broadcast(tx.toHex());
  console.log(`Success! Txid is ${txid}`);
};
main();
