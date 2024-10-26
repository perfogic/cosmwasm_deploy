import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { OraichainConfig, WasmLocalConfig } from "../constants/networks";
import {
  AppBitcoinClient,
  CwBitcoinClient,
  LightClientBitcoinClient,
} from "../../bindings";
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
import { TokenfactoryClient } from "../../bindings";
import { fromBech32, toBech32 } from "@cosmjs/encoding";

// mainnet: orai1plhnld6489hpxay9wfel8mp39esw625pnufq03p9tg0d8u60987s99l7z6
// testnet: orai16qnhuc5jpp4h322ju4ass3z05hw2du0e9k5t5knzwcqyjr3rmzrsa8s5ag
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  const bip32 = BIP32Factory(ecc);
  const seed = crypto.randomBytes(32);
  const node = bip32.fromSeed(seed, btc.networks.bitcoin);
  // const node = bip32.fromBase58(
  //   "tprv8ZgxMBicQKsPdhNhSUGBbeSckFPQpAdPdZTPQ2JsFZwvQBiT7hwcUeJCFpfPHP9h3hVdABAN2p64eF8qthSqKrkqB4EQJ2vkSpWWujmQEbU", // just a seed test for local
  //   btc.networks.testnet
  // );
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

  const cwLightClientBitcoin = new LightClientBitcoinClient(
    client,
    address,
    "orai1rdykz2uuepxhkarar8ql5ajj5j37pq8h8d4zarvgx2s8pg0af37qucldna"
  );

  const cwAppBitcoinClient = new AppBitcoinClient(
    client,
    address,
    "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz"
  );

  console.log("Building index:", await cwAppBitcoinClient.buildingIndex());

  let tx;

  // UPDATE CONFIG
  // tx = await cwAppBitcoinClient.updateConfig({
  // tokenFee: {
  //   nominator: 0,
  //   denominator: 1000,
  // },
  //   tokenFeeReceiver: "orai1a5cec5y3l42ztxrfnu7qmerscj8ulggyrr96a8",
  //   relayerFeeReceiver: "orai1a5cec5y3l42ztxrfnu7qmerscj8ulggyrr96a8",
  // });
  // console.log(tx.transactionHash);

  // console.log(await cwAppBitcoinClient.config());

  // tx = await client.updateAdmin(
  //   address,
  //   "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
  //   "orai1wn0qfdhn7xfn7fvsx6fme96x4mcuzrm9wm3mvlunp5e737rpgt4qndmfv8",
  //   "auto"
  // );
  // console.log(tx.transactionHash);

  // tx = await client.updateAdmin(
  //   address,
  //   "orai1rdykz2uuepxhkarar8ql5ajj5j37pq8h8d4zarvgx2s8pg0af37qucldna",
  //   "orai1wn0qfdhn7xfn7fvsx6fme96x4mcuzrm9wm3mvlunp5e737rpgt4qndmfv8",
  //   "auto"
  // );
  // console.log(tx.transactionHash);

  // UPDATE WHITELIST
  // tx = await cwAppBitcoinClient.setWhitelistValidator({
  //   permission: true,
  //   valAddr: "orai1ltr3sx9vm9hq4ueajvs7ng24gw3k8t9t67y73h",
  // });
  // console.log(tx.transactionHash);
  // tx = await cwAppBitcoinClient.setWhitelistValidator({
  //   permission: true,
  //   valAddr: "orai1q53ujvvrcd0t543dsh5445lu6ar0qr2z9ll7ux",
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
  // tx = await cwAppBitcoinClient.registerDenom(
  //   {
  //     subdenom: "obtc",
  //   },
  //   "auto",
  //   "",
  //   [coin("10000000", "orai")]
  // );
  // console.log(tx.transactionHash);

  // CHANGE DENOM OWNER
  // tx = await cwAppBitcoinClient.changeBtcDenomOwner({
  //   newOwner: "orai1yzmjgpr08u7d9n9qqhvux9ckfgq32z77c04lkg",
  // });
  // console.log(tx.transactionHash);

  // BURN TOKENS
  // let tokenFactoryClient = new TokenfactoryClient(
  //   client,
  //   address,
  //   "orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9"
  // );
  // tx = await tokenFactoryClient.burnTokens({
  //   amount: "66424000000",
  //   burnFromAddress: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
  //   denom:
  //     "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc",
  // });
  // console.log(tx.transactionHash);
  // tx = await tokenFactoryClient.changeDenomOwner({
  //   denom:
  //     "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc",
  //   newAdminAddress:
  //     "orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz",
  // });
  // console.log(tx.transactionHash);

  // UPDATE CONFIG
  // tx = await cwBitcoinClient.updateConfig({
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
  // mainnet
  // tx = await cwBitcoinClient.updateHeaderConfig({
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

  // testnet
  // tx = await cwLightClientBitcoin.updateHeaderConfig({
  //   config: {
  //     max_length: 24192,
  //     max_time_increase: 2 * 60 * 60,
  //     trusted_height: 2981664,
  //     retarget_interval: 2016,
  //     target_spacing: 10 * 60,
  //     target_timespan: 2016 * (10 * 60),
  //     max_target: 0x1d00ffff,
  //     retargeting: true,
  //     min_difficulty_blocks: true,
  //     trusted_header: Buffer.from(
  //       toBinaryBlockHeader({
  //         version: 830308352,
  //         prev_blockhash:
  //           "000000000000083c1306d75a0c18b0942d0ad0aecb878e24c164a9caa3fb2ad3",
  //         merkle_root:
  //           "c170d6636e84b023bdb3128ba375de72d25e31db4f7049694bff7bbf0b463020",
  //         time: 1726956958,
  //         bits: 436469756,
  //         nonce: 17918350,
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
