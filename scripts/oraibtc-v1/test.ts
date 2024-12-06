import * as btc from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import { redeemScript } from '@oraichain/bitcoin-bridge-lib-js';

const main = async () => {
  const bip32 = BIP32Factory(ecc);
  const network = btc.networks.testnet;
  // create me random private key
  // const mnemonic = bip39.generateMnemonic();
  // console.log('Mnemonic:', mnemonic);
  // const seed = await bip39.mnemonicToSeed(mnemonic);
  // const node = bip32.fromSeed(seed, network);
  // console.log(node.toBase58());

  // console.log('Seed:', seed.toString('hex'));

  let allNodes = [
    'tprv8ZgxMBicQKsPe5TSGJ7cf4ZsEbFm4LjMji7FMmrTKeQ55FuNUg5m1uiDyXUQaw1hheceNTxWF1dM4GLpEgdvKiV9RgANCdTY48SdychNFLA',
    'tprv8ZgxMBicQKsPedVWrhVGi8GWRwXxySRNq6cEm29JcHh4wCxSWUk2wmMkAS7FkxwHUjiDbkPtaSjLFAeDY4vmYiwVAhnTyRZ5uXsi31rVgJb',
  ].map((item) => bip32.fromBase58(item, network));
  let allPubkeys = allNodes.map((item) => item.derive(261).publicKey.toJSON().data);

  console.dir(
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
      ],
    },
    { depth: null }
  );
  let depositScript = redeemScript(
    {
      create_time: 1730103775,
      index: 261,
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
      ],
    },
    Buffer.from([0]),
    [2, 3]
  );

  let addr = btc.payments.p2wsh({
    redeem: { output: depositScript },
    network,
  });

  console.log('Address:', addr.address);
};

main();
