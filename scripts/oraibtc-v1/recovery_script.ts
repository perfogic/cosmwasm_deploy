import * as btc from 'bitcoinjs-lib';
import axios from 'axios';
import { redeemScript, Signatory, SigSet } from './index';
import { witnessStackToScriptWitness } from './witness_stack_to_script_witness';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { broadcast } from './blockstream_utils';
import { broadcast as broadcastTestnet } from './blockstream_testnet_utils';

const getSignatories = async (): Promise<Signatory[]> => {
  const data = await axios.get('https://btc.lcd.orai.io/bitcoin/sigset?index=261');
  return data.data.sigset.signatories.map((item: any) => {
    return {
      voting_power: item.voting_power,
      pubkey: item.pubkey.bytes,
    };
  });
};

const getSigset = async (): Promise<SigSet> => {
  const data = await axios.get('https://btc.relayer.orai.io/sigset');
  return data.data;
};

const getTestSignatories = async (): Promise<Signatory[]> => {
  return [
    {
      pubkey: [
        3, 192, 88, 41, 213, 252, 225, 221, 183, 108, 164, 64, 17, 232, 191, 75, 99, 228, 155, 114,
        178, 235, 187, 126, 98, 174, 189, 198, 197, 161, 30, 42, 151,
      ],
      voting_power: 100,
    },
    {
      pubkey: [
        2, 138, 134, 5, 248, 203, 200, 198, 47, 215, 107, 89, 4, 202, 189, 63, 94, 81, 45, 166, 237,
        82, 242, 129, 148, 172, 3, 64, 107, 89, 170, 225, 64,
      ],
      voting_power: 100,
    },
  ];
};

enum NetworkType {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

const main = async () => {
  let networkType = NetworkType.Testnet;
  //@ts-ignore
  const isMainnet = networkType == NetworkType.Mainnet;
  const bip32 = BIP32Factory(ecc);
  //@ts-ignore
  const network = isMainnet ? btc.networks.bitcoin : btc.networks.testnet;
  const sigset = await getSigset();

  const signatories = isMainnet ? await getSignatories() : await getTestSignatories();
  const xprivs = [
    'tprv8ZgxMBicQKsPe5TSGJ7cf4ZsEbFm4LjMji7FMmrTKeQ55FuNUg5m1uiDyXUQaw1hheceNTxWF1dM4GLpEgdvKiV9RgANCdTY48SdychNFLA',
    'tprv8ZgxMBicQKsPedVWrhVGi8GWRwXxySRNq6cEm29JcHh4wCxSWUk2wmMkAS7FkxwHUjiDbkPtaSjLFAeDY4vmYiwVAhnTyRZ5uXsi31rVgJb',
  ];
  const script = redeemScript({ ...sigset, signatories }, Buffer.from([0]));
  let data = btc.payments.p2wsh({
    redeem: { output: script, redeemVersion: 0 },
    network,
  });
  console.log(data.address);

  // FIXME: change btc receiver here
  const btcReceiver = 'tb1qq5y8l073ev8z4mh7lvara2y9d96sz2zmn4zja9';

  // FIXME: transaction hash
  const transactionHash = '6285594967e2ef2bc2cdb53c5641553509cf22875b1eb315038d260ab3a475dc';
  const transactionIndex = 0;

  // FIXME: set the correct sats for 1 BTC here
  const spendAmountInSats = 1500000;
  // FIXME: get valid transaction fees for the mainnet
  const feeForTransactionInSats = 1000;
  const withdrawAmountInSats = spendAmountInSats - feeForTransactionInSats;
  console.log('withdraw amount: ', withdrawAmountInSats);
  const remainingAmount = spendAmountInSats - withdrawAmountInSats - feeForTransactionInSats;
  console.log('remaining amount: ', remainingAmount);

  const psbt = new btc.Psbt({
    network,
  });
  psbt.addInput({
    hash: transactionHash,
    index: transactionIndex,
    witnessUtxo: {
      script: data.output!,
      value: spendAmountInSats,
    },
    witnessScript: script,
  });
  psbt.addOutput({
    address: btcReceiver,
    value: withdrawAmountInSats,
  });
  // add redundant amount back to previous address
  if (remainingAmount > 0) {
    psbt.addOutput({
      address: data.address!,
      value: remainingAmount,
    });
  }

  for (const xpriv of xprivs) {
    const node = bip32.fromBase58(xpriv, network);
    psbt.signInput(0, node.derive(261));
  }
  psbt.finalizeInput(0, (inputIndex: number, psbtInput: any) => {
    const redeemPayment = btc.payments.p2wsh({
      redeem: {
        input: btc.script.compile(
          psbtInput.partialSig.map((item: any) => item.signature).reverse()
        ), // Make sure to be putted in a correct orders
        output: psbtInput.witnessScript,
      },
    });
    const finalScriptWitness = witnessStackToScriptWitness(redeemPayment.witness ?? []);

    return {
      finalScriptSig: Buffer.from(''),
      finalScriptWitness: finalScriptWitness,
    };
  });

  const tx = psbt.extractTransaction();
  console.log('\nBtc receiver: ', btcReceiver + '\n');
  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);

  if (isMainnet) {
    const txid = await broadcast(tx.toHex());
    console.log(`Success! Txid is ${txid}`);
  } else {
    const txid = await broadcastTestnet(tx.toHex());
    console.log(`Success! Txid is ${txid}`);
  }
};

main();
