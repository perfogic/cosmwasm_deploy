import * as btc from 'bitcoinjs-lib';
import axios from 'axios';
import { redeemScript, SigSet } from './index';

const getSigsets = async (): Promise<SigSet> => {
  const data = await axios.get('https://btc.lcd.orai.io/bitcoin/sigset?index=260');
  return data.data;
};

const main = async () => {
  const network = btc.networks.bitcoin;
  const sigsets = await getSigsets();
  console.log(sigsets);
  const script = redeemScript(sigsets, Buffer.from([]));
  let data = btc.payments.p2wsh({
    redeem: { output: script, redeemVersion: 0 },
    network,
  });
  console.log(data.address);
};

main();
