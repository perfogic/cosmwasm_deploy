import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { OraichainConfig } from "./networks";
import { CwBitcoinClient } from "../bindings";
import { toBinaryBlockHeader } from "@oraichain/bitcoin-bridge-wasm-sdk";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import * as btc from "bitcoinjs-lib";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  const bip32 = BIP32Factory(ecc);
  // const seed = crypto.randomBytes(32);
  // console.log({ seed });
  // const node = bip32.fromSeed(seed, btc.networks.testnet);
  const node = bip32.fromBase58(
    "tprv8ZgxMBicQKsPdhNhSUGBbeSckFPQpAdPdZTPQ2JsFZwvQBiT7hwcUeJCFpfPHP9h3hVdABAN2p64eF8qthSqKrkqB4EQJ2vkSpWWujmQEbU", // just a seed test for local
    btc.networks.testnet
  );
  // get extended pubkey here
  const xpriv = node.toBase58();
  const xpub = node.neutered().toBase58();

  // upload contract
  const cwBitcoinClient = new CwBitcoinClient(
    client,
    address,
    "orai1zzvs74k585jwan9mf2xxlx9dppwk8m9z2lc6r4836vhdgtfn4vxss3lf8h"
  );

  // UPDATE CONFIG
  // const tx = await cwBitcoinClient.updateConfig({
  //   tokenFee: {
  //     nominator: 1,
  //     denominator: 1000,
  //   },
  // });
  // console.log(tx.transactionHash);

  // ADD VALIDATORS
  // const array = new Uint8Array(32);
  // const tx = await cwBitcoinClient.addValidators({
  //   addrs: [
  //     "orai163gprd7pnv2xt664fm7nx04j6wh587fd0d4aw6",
  //     "orai1kcppeg78s6fmyjsw5rjvh06f9jm2uhpdnckzw8",
  //   ],
  //   consensusKeys: [Array.from(array.fill(0)), Array.from(array.fill(1))],
  //   votingPowers: [10, 10],
  // });
  // console.log(tx.transactionHash);

  // UPDATE HEADER CONFIG
  // const tx = await cwBitcoinClient.updateHeaderConfig({
  //   config: {
  //     max_length: 24192,
  //     max_time_increase: 2 * 60 * 60,
  //     trusted_height: 2574432,
  //     retarget_interval: 2016,
  //     target_spacing: 10 * 60,
  //     target_timespan: 2016 * (10 * 60),
  //     max_target: 0x1d00ffff,
  //     retargeting: true,
  //     min_difficulty_blocks: true,
  //     trusted_header: Buffer.from(
  //       toBinaryBlockHeader({
  //         version: 536870912,
  //         prev_blockhash:
  //           "000000000000001f6d8dc4976552a596eff2eb0df15b0d9ee61a55091a2050c2",
  //         merkle_root:
  //           "03a2f5712c4c44daafa6475007de611b91be9738fc005788b7072153d651f36f",
  //         time: 1705736135,
  //         bits: 422015362,
  //         nonce: 3433041756,
  //       })
  //     ).toString("base64"),
  //   },
  // });
  // console.log(tx.transactionHash);
}

main().then(
  () => {
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
