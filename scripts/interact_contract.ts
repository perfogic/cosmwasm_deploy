import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { OraichainConfig } from "./networks";
import { CwBitcoinClient } from "../bindings";
import {
  fromBase64Script,
  fromBinaryScript,
  toBinaryBlockHeader,
  toBinaryScript,
} from "@oraichain/bitcoin-bridge-wasm-sdk";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import * as btc from "bitcoinjs-lib";
import { generateDepositAddress } from "@oraichain/bitcoin-bridge-lib-js";
import { coin } from "@cosmjs/stargate";

// orai16qnhuc5jpp4h322ju4ass3z05hw2du0e9k5t5knzwcqyjr3rmzrsa8s5ag
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

  // const depositAddress = await generateDepositAddress({
  //   dest: {
  //     address: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
  //   },
  //   relayers: ["http://18.191.171.150:8000"],
  //   network: "testnet",
  // });
  // console.log(depositAddress);

  // upload contract
  const cwBitcoinClient = new CwBitcoinClient(
    client,
    address,
    "orai16qnhuc5jpp4h322ju4ass3z05hw2du0e9k5t5knzwcqyjr3rmzrsa8s5ag"
  );

  // WITHDRAW
  // const withdrawAddress = "tb1qewgfymc9ssrszh7dh202rtsgz3yjzvyyk77vzv";

  // console.log(
  //   btc.address
  //     .toOutputScript(withdrawAddress, btc.networks.testnet)
  //     .toString("hex")
  // );

  // const tx = await cwBitcoinClient.withdrawToBitcoin(
  //   {
  //     btcAddress: withdrawAddress,
  //   },
  //   "auto",
  //   "",
  //   [
  //     coin(
  //       21000000000,
  //       "factory/orai17hyr3eg92fv34fdnkend48scu32hn26gqxw3hnwkfy904lk9r09qqzty42/XuanDang"
  //     ),
  //   ]
  // );
  // console.log(tx.transactionHash);

  // UPDATE BITCOIN CONFIG
  // const bitcoinConfig = await cwBitcoinClient.bitcoinConfig();
  // const tx = await cwBitcoinClient.updateBitcoinConfig({
  //   config: {
  //     ...bitcoinConfig,
  //     min_withdrawal_checkpoints: 0,
  //   },
  // });
  // console.log(tx.transactionHash);

  // console.log(await cwBitcoinClient.valueLocked());

  // const tx = await cwBitcoinClient.changeBtcDenomOwner({
  //   newOwner: "orai16qnhuc5jpp4h322ju4ass3z05hw2du0e9k5t5knzwcqyjr3rmzrsa8s5ag",
  // });
  // console.log(tx.transactionHash);

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
  //   addrs: ["orai163gprd7pnv2xt664fm7nx04j6wh587fd0d4aw6"],
  //   consensusKeys: [Array.from(array.fill(0))],
  //   votingPowers: [10],
  // });
  // console.log(tx.transactionHash);

  // UPDATE HEADER CONFIG
  const tx = await cwBitcoinClient.updateHeaderConfig({
    config: {
      max_length: 24192,
      max_time_increase: 2 * 60 * 60,
      trusted_height: 2872800,
      retarget_interval: 2016,
      target_spacing: 10 * 60,
      target_timespan: 2016 * (10 * 60),
      max_target: 0x1d00ffff,
      retargeting: true,
      min_difficulty_blocks: true,
      trusted_header: Buffer.from(
        toBinaryBlockHeader({
          version: 654221312,
          prev_blockhash:
            "000000000000000591b541ed7088c4ce52fd10a0b99a4b5db377a3c1ab198756",
          merkle_root:
            "7f718cbfe30ad75f698ac6fdacb0a5c53aae8dfab2c5642a657fb8e03c766880",
          time: 1723142223,
          bits: 420466436,
          nonce: 732839121,
        })
      ).toString("base64"),
    },
  });
  console.log(tx.transactionHash);
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
