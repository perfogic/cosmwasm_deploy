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
const main = async () => {
  let network = dogecoin.dogeCoin;
  const bip32 = BIP32Factory(ecc);
  const seed = Buffer.from(
    "53c008c05f0a7b913c34779038eff44a6bb94b134adbc60433ea817ba93e555a",
    "hex"
  );
  const seed2 = Buffer.from(
    "5b6048d2c6c98c1a0bf57a347e09731bec04cab0b42407af30c13e47bd1137e4",
    "hex"
  );
  const node = bip32.fromSeed(seed, network);
  const node2 = bip32.fromSeed(seed2, network);
  //   const xpriv = node.toBase58();
  const pubkey = node.neutered().publicKey.toJSON().data;
  const pubkey2 = node2.neutered().publicKey.toJSON().data;
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
            bytes: pubkey,
          },
          voting_power: 100,
        },
        {
          pubkey: {
            bytes: pubkey2,
          },
          voting_power: 100,
        },
      ],
    },
    Buffer.from(dest),
    [2, 3]
  );
  let script = dogecoin.payments.p2sh({
    redeem: { output: depositScript },
    network,
  });
  console.log("Address:", script.address);
  const psbt = new btc.Psbt({
    network,
  });
  psbt.addInput({
    hash: "6bf14a54c3e825455ca397cc8d2f61a5795e05b59567901f806cc483b34b88a1",
    index: 0,
    nonWitnessUtxo: Buffer.from(
      "01000000018aabf36ee111617c28634e6168494f6b71f06ed1bc2c1deb0c164fcfd7db6558000000006b483045022100e87be8d7e738cccf8edf10b6347b6a10204eadc3334a30e97babd9a34ca5a1a602203609c381fe30ca29e97f4341c26ac807bcb40fb143a487f6c62e7f26651205ae012102a8949a24e181983f8f567595b09207cee1b34aa288119d30888989de236611edffffffff0200ca9a3b0000000017a9141bc084f1e33c16e32fdf56667a22df94bb613a1287b0202c1c000000001976a914b234ff71ba9b849964ebc5ddb5e1676da1ad5de188ac00000000",
      "hex"
    ),
    redeemScript: depositScript,
  });
  psbt.addOutput({
    address: "DMPNJkv66MRTzcRdYgw2ZiPsY6G66kVWMo",
    value: 70000000,
  });
  psbt.signInput(0, node);
  psbt.signInput(0, node2);
  psbt.finalizeInput(0, (inputIndex: number, psbtInput: any) => {
    const redeemPayment = btc.payments.p2sh({
      redeem: {
        input: btc.script.compile(
          psbtInput.partialSig.map((item: any) => item.signature).reverse()
        ), // Make sure to be putted in a correct orders
        output: psbtInput.redeemScript,
      },
    });
    return {
      finalScriptSig: redeemPayment.input!,
    } as any;
  });
  const tx = psbt.extractTransaction(true);
  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  //   const txid = await broadcast(tx.toHex());
  //   console.log(`Success! Txid is ${txid}`);
};
main();
