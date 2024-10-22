import { getMnemonic } from "../helpers/utils";
import { connect } from "../helpers/connect";
import {
  OraiBtcLocalConfig,
  OraiBtcMainnetConfig,
  OraiBtcSubnetConfig,
} from "../constants/networks";
import { coin, StdFee } from "@cosmjs/amino";
// import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Field, Type } from "protobufjs";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(
    mnemonic,
    OraiBtcLocalConfig,
    false
  );

  const sendMsg1 = {
    typeUrl: "nomic/MsgClaimIbcBitcoin",
    value: {},
  };

  const MsgData = new Type("MsgData");
  client.registry.register(sendMsg1.typeUrl, MsgData);

  const txRaw = await client.sign(
    address,
    [sendMsg1],
    {
      amount: [coin("0", OraiBtcLocalConfig.feeToken)],
      gas: "0",
    } as StdFee,
    "",
    {
      accountNumber: 0,
      chainId: OraiBtcLocalConfig.chainId,
      sequence: 12,
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
