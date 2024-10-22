import { getMnemonic } from "../helpers/utils";
import { connect } from "../helpers/connect";
import {
  OraiBtcMainnetConfig,
  OraiBtcSubnetConfig,
} from "../constants/networks";
import { coin, StdFee } from "@cosmjs/amino";
// import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Secp256k1HdWallet } from "@cosmjs/amino";
import { isOfflineDirectSigner } from "@cosmjs/proto-signing";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { BinaryWriter, BinaryReader } from "cosmjs-types/binary";
import { isSet } from "util/types";

interface MsgSendOraiBtc {
  from_address: string;
  to_address: string;
  amount: Coin[];
}

function createBaseMsgSend(): MsgSendOraiBtc {
  return {
    from_address: "",
    to_address: "",
    amount: [],
  };
}
export const MsgSendOraiBtc = {
  typeUrl: "cosmos-sdk/MsgSend",
  encode(
    message: MsgSendOraiBtc,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.from_address !== "") {
      writer.uint32(10).string(message.from_address);
    }
    if (message.to_address !== "") {
      writer.uint32(18).string(message.to_address);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSendOraiBtc {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSend();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from_address = reader.string();
          break;
        case 2:
          message.to_address = reader.string();
          break;
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MsgSendOraiBtc {
    const obj = createBaseMsgSend();
    if (isSet(object.from_address))
      obj.from_address = String(object.from_address);
    if (isSet(object.to_address)) obj.to_address = String(object.to_address);
    if (Array.isArray(object?.amount))
      obj.amount = object.amount.map((e: any) => Coin.fromJSON(e));
    return obj;
  },
  toJSON(message: MsgSendOraiBtc): unknown {
    const obj: any = {};
    message.from_address !== undefined &&
      (obj.from_address = message.from_address);
    message.to_address !== undefined && (obj.to_address = message.to_address);
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.amount = [];
    }
    return obj;
  },
  fromPartial(object: any): MsgSendOraiBtc {
    const message = createBaseMsgSend();
    message.from_address = object.from_address ?? "";
    message.to_address = object.to_address ?? "";
    message.amount = object.amount?.map((e: any) => Coin.fromPartial(e)) || [];
    return message;
  },
};

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(mnemonic, OraiBtcSubnetConfig);

  const sendMsg = {
    typeUrl: "cosmos-sdk/MsgSend",
    value: {
      from_address: address,
      to_address: "oraibtc1rchnkdpsxzhquu63y6r4j4t57pnc9w8ea88hue",
      amount: [
        {
          denom: OraiBtcMainnetConfig.feeToken,
          amount: "350000000",
        },
      ],
    },
  };

  client.registry.register("cosmos-sdk/MsgSend", MsgSendOraiBtc);

  console.log(sendMsg, MsgSendOraiBtc.encode(sendMsg.value).finish());
  const txRaw = await client.sign(
    address,
    [sendMsg],
    {
      amount: [coin("0", OraiBtcSubnetConfig.feeToken)],
      gas: "0",
    } as StdFee,
    "",
    {
      accountNumber: 0,
      chainId: OraiBtcSubnetConfig.chainId,
      sequence: 2,
    }
  );
  const txBytes = TxRaw.encode(txRaw).finish();
  const txData = await client.broadcastTx(txBytes);
  console.log(txData);
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
