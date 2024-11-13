import { decodeTxRaw } from '@cosmjs/proto-signing';
import * as injProto from '@injectivelabs/core-proto-ts';
import { GasFee } from '@injectivelabs/sdk-ts';
import { MsgType } from '@injectivelabs/ts-types';
import crypto from 'crypto';

const typeMap = Object.fromEntries(Object.entries(MsgType).map(([k, v]) => ['/' + v, k]));

type TxType = keyof typeof MsgType;

const findType: any = (obj: any, type: string) => {
  if (typeof obj !== 'object') return;
  const msg = obj[type];
  if (msg && msg.decode) return msg;
  for (const subObj of Object.values(obj)) {
    const find = findType(subObj, type);
    if (find) return find;
  }
};

const decodeProto = (msg: { typeUrl: string; value: Uint8Array }) => {
  const type = typeMap[msg.typeUrl];
  if (type) {
    const obj = findType(injProto, type);
    if (obj) {
      const res = obj.decode(msg.value);
      res.type = type;
      if (res.msgs) {
        res.msgs = res.msgs.map(decodeProto);
      }
      return res;
    }
  }
};

export type FrontRunInfo = {
  fee: GasFee;
  msgs: object[];
};

class FrontRunClient {
  public readonly rpc: string;
  constructor(rpc: string) {
    this.rpc = rpc.replace(/\/+$/, '');
  }

  async queryPendingTxs(types: TxType[] = [], limit = 30): Promise<FrontRunInfo[]> {
    const { result } = await fetch(`${this.rpc}/unconfirmed_txs?limit=${limit}`).then((res) =>
      res.json()
    );
    return result.txs.map((txRaw: string) => {
      // const tx = decodeTxRaw(Buffer.from(txRaw, "base64"));
      // const { amount, gasLimit, ...rest } = tx.authInfo.fee as any;
      // const info: FrontRunInfo = {
      //   fee: {
      //     amounts: amount,
      //     gasLimit: gasLimit.toNumber(),
      //     ...rest,
      //   },
      //   msgs: tx.body.messages
      //     .filter((msg) => {
      //       if (!types || types.length == 0) return true;
      //       const type = typeMap[msg.typeUrl] as TxType;
      //       return types.includes(type);
      //     })
      //     .map(decodeProto),
      // };

      return crypto.createHash('sha256').update(txRaw).digest('hex');
    });
  }
}

(async () => {
  const frontRunClient = new FrontRunClient('https://osmosis-rpc.stake-town.com/');
  const frontRunClient2 = new FrontRunClient('https://rpc-osmosis.ecostake.com/');
  const pendingTxs = await Promise.all([
    frontRunClient.queryPendingTxs(),
    frontRunClient2.queryPendingTxs(),
  ]);
  console.log(pendingTxs);
})();
