import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { OraichainConfig, WasmLocalConfig } from "./networks";
import { AppBitcoinClient, CwBitcoinClient } from "../bindings";
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
import crypto, { createHash } from "crypto";
import { TokenfactoryClient } from "../bindings";

// mainnet: orai1plhnld6489hpxay9wfel8mp39esw625pnufq03p9tg0d8u60987s99l7z6
// testnet: orai16qnhuc5jpp4h322ju4ass3z05hw2du0e9k5t5knzwcqyjr3rmzrsa8s5ag
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, WasmLocalConfig);

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
  // const cwBitcoinClient = new CwBitcoinClient(
  //   client,
  //   address,
  //   "orai1plhnld6489hpxay9wfel8mp39esw625pnufq03p9tg0d8u60987s99l7z6"
  // );

  const cwAppBitcoinClient = new AppBitcoinClient(
    client,
    address,
    "orai14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9savsjyw"
  );
  console.log(address);
  console.log(
    await cwAppBitcoinClient.stakingValidator({
      valAddr: "oraivaloper1r7yp29q0u7n5v49zmtp6k6w2wwzhqh3hwt0vwa",
    })
  );

  // console.log(await client.execute(

  // UPDATE CONFIG
  // const tx = await cwBitcoinClient.updateConfig({
  //   tokenFee: {
  //     nominator: 0,
  //     denominator: 1000,
  //   },
  // });
  // console.log(tx.transactionHash);

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

  // CREATE DENOM
  // const tx = await cwBitcoinClient.registerDenom(
  //   {
  //     subdenom: "obtc",
  //   },
  //   "auto",
  //   "",
  //   [coin("10000000", "orai")]
  // );
  // console.log(tx.transactionHash);

  // CHANGE DENOM OWNER
  // const tx = await cwBitcoinClient.changeBtcDenomOwner({
  //   newOwner: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
  // });
  // console.log(tx.transactionHash);

  // BURN TOKENS
  // let tokenFactoryClient = new TokenfactoryClient(
  //   client,
  //   address,
  //   "orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9"
  // );
  // const tx = await tokenFactoryClient.burnTokens({
  //   amount: "110584000000",
  //   burnFromAddress: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
  //   denom:
  //     "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc",
  // });
  // console.log(tx.transactionHash);
  // const tx = await tokenFactoryClient.changeDenomOwner({
  //   denom:
  //     "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc",
  //   newAdminAddress:
  //     "orai1plhnld6489hpxay9wfel8mp39esw625pnufq03p9tg0d8u60987s99l7z6",
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
  // const cosmosAddress = "orai1etgw2z7ecp6xej9t0zfhgdw9jxx2mywyktnhfd";
  // const hashAddress = createHash("sha256").update(cosmosAddress).digest();
  // const tx = await cwBitcoinClient.addValidators({
  //   addrs: [cosmosAddress],
  //   consensusKeys: [Array.from(hashAddress)],
  //   votingPowers: [100],
  // });
  // console.log(tx.transactionHash);

  // UPDATE HEADER CONFIG
  // const tx = await cwBitcoinClient.updateHeaderConfig({
  //   config: {
  //     max_length: 24192,
  //     max_time_increase: 2 * 60 * 60,
  //     trusted_height: 858816,
  //     retarget_interval: 2016,
  //     target_spacing: 10 * 60,
  //     target_timespan: 2016 * (10 * 60),
  //     max_target: 0x1d00ffff,
  //     retargeting: true,
  //     min_difficulty_blocks: false,
  //     trusted_header: Buffer.from(
  //       toBinaryBlockHeader({
  //         version: 850419712,
  //         prev_blockhash:
  //           "0000000000000000000073036581ef712215c5f9aebfeb7d2fba84a2f71dd69f",
  //         merkle_root:
  //           "2c7ea8a9d258edbcfd523263a2634ea4ab5a0090e7b10432ebc2cf0f85392156",
  //         time: 1724855515,
  //         bits: 386082139,
  //         nonce: 1792826660,
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
