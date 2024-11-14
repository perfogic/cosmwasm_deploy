import { SimulateCosmWasmClient } from '@oraichain/cw-simulate';
import {
  downloadState,
  downloadWasmStateIfNotExist,
  loadCodeAndState,
} from '../../helpers/simulate';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { AppBitcoinClient } from './contracts-sdk';

const SENDER = 'orai1qv5jn7tueeqw7xqdn5rem7s09n7zletrsnc5vq';
const CW_BITCOIN_CONTRACT = 'orai12sxqkgsystjgd9faa48ghv3zmkfqc6qu05uy20mvv730vlzkpvls5zqxuz';
const CW_LIGHT_CLIENT = 'orai1rdykz2uuepxhkarar8ql5ajj5j37pq8h8d4zarvgx2s8pg0af37qucldna';

const main = async () => {
  const simulateClient = new SimulateCosmWasmClient({
    chainId: 'oraichain',
    bech32Prefix: 'orai',
    metering: true,
  });
  await downloadWasmStateIfNotExist(__dirname, CW_BITCOIN_CONTRACT)();
  await downloadWasmStateIfNotExist(__dirname, CW_LIGHT_CLIENT)();
  await loadCodeAndState(
    simulateClient,
    CW_BITCOIN_CONTRACT,
    resolve(__dirname, `./data/${CW_BITCOIN_CONTRACT}`),
    {
      codeId: 0,
      creator: SENDER,
      admin: SENDER,
      label: '',
      created: 0,
    }
  );
  await loadCodeAndState(
    simulateClient,
    CW_LIGHT_CLIENT,
    resolve(__dirname, `./data/${CW_LIGHT_CLIENT}`),
    {
      codeId: 1,
      creator: SENDER,
      admin: SENDER,
      label: '',
      created: 0,
    }
  );
  const cwAppBitcoin = new AppBitcoinClient(simulateClient as any, SENDER, CW_BITCOIN_CONTRACT);
  const cwLightClient = new AppBitcoinClient(simulateClient as any, SENDER, CW_LIGHT_CLIENT);

  const signatoryKey = await cwAppBitcoin.signatoryKey({
    addr: SENDER,
  });
  console.log({
    signatoryKey,
  });

  const changeRates = await cwAppBitcoin.changeRates({
    interval: 24 * 60 * 60,
  });
  console.log(changeRates);
};

main();
