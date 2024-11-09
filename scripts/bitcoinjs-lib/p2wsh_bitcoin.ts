import * as btc from "bitcoinjs-lib";
import { BitcoinNetwork, redeemScript } from "@oraichain/bitcoin-bridge-lib-js";
import {
  commitmentBytes,
  encodeXpub,
} from "@oraichain/bitcoin-bridge-wasm-sdk";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";
import { broadcast } from "./blockstream_utils";

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
      possible_vp: 200,
      present_vp: 200,
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
          voting_power: 1,
        },
        {
          pubkey: {
            bytes: allPubkeys[2],
          },
          voting_power: 100,
        },
      ],
    },
    Buffer.from(dest),
    [2, 3]
  );
  let script = btc.payments.p2wsh({
    redeem: { output: depositScript },
    network,
  });
  console.log("Address:", script.address);
  const psbt = new btc.Psbt({
    network,
  });

  const spendAmountInSats = 10000;
  psbt.addInput({
    hash: "6db535d5c3b090d1759ff2ee543a6a48403f255f1c239eacd11a5e0eaed0dbfa",
    index: 0,
    witnessUtxo: {
      script: script.output!,
      value: spendAmountInSats,
    },
    witnessScript: depositScript,
  });
  psbt.addOutput({
    address: "tb1qewgfymc9ssrszh7dh202rtsgz3yjzvyyk77vzv",
    value: spendAmountInSats - 1000,
  });
  psbt.signInput(0, allNodes[0]);
  psbt.signInput(0, allNodes[2]);
  psbt.finalizeInput(0, (inputIndex: number, psbtInput: any) => {
    const redeemPayment = btc.payments.p2wsh({
      redeem: {
        input: btc.script.compile(
          psbtInput.partialSig.map((item: any) => item.signature).reverse()
        ), // Make sure to be putted in a correct orders
        output: psbtInput.witnessScript,
      },
    });
    const finalScriptWitness = witnessStackToScriptWitness(
      redeemPayment.witness ?? []
    );

    return {
      finalScriptSig: Buffer.from(""),
      finalScriptWitness: finalScriptWitness,
    };
  });
  const tx = psbt.extractTransaction(true);
  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  const txid = await broadcast(tx.toHex());
  console.log(`Success! Txid is ${txid}`);
};
main();
