import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraiBtcMainnetConfig, OraiBtcSubnetConfig } from "./networks";
import { coin, StdFee } from "@cosmjs/amino";
// import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import axios from "axios";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(
    mnemonic,
    OraiBtcMainnetConfig,
    false
  );

  const res = await fetch(
    `https://btc.lcd.orai.io/auth/accounts/${address}`
  ).then((res) => res.json());
  const sequence = res.result.value.sequence;

  const sendMsg1 = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: address,
      toAddress: process.env.ORAIBTC_RECEIVER_ADDRESS,
      amount: [
        {
          denom: OraiBtcMainnetConfig.feeToken,
          amount: (
            parseInt(process.env.ORAIBTC_AMOUNT || "0") *
            10 ** 6
          ).toString(),
        },
      ],
    },
  };

  const txRaw = await client.sign(
    address,
    [sendMsg1],
    {
      amount: [coin("0", OraiBtcMainnetConfig.feeToken)],
      gas: "20000000",
    } as StdFee,
    "",
    {
      accountNumber: 0,
      chainId: OraiBtcMainnetConfig.chainId,
      sequence: sequence,
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
