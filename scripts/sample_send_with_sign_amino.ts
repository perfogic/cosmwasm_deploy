import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraiBtcMainnetConfig, OraiBtcSubnetConfig } from "./networks";
import { coin, StdFee } from "@cosmjs/amino";
// import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(
    mnemonic,
    OraiBtcSubnetConfig,
    false
  );

  const sendMsg1 = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: address,
      toAddress: "oraibtc1rchnkdpsxzhquu63y6r4j4t57pnc9w8ea88hue",
      amount: [
        {
          denom: OraiBtcSubnetConfig.feeToken,
          amount: "350000000",
        },
      ],
    },
  };

  const txRaw = await client.sign(
    address,
    [sendMsg1],
    {
      amount: [coin("0", OraiBtcSubnetConfig.feeToken)],
      gas: "0",
    } as StdFee,
    "",
    {
      accountNumber: 0,
      chainId: OraiBtcSubnetConfig.chainId,
      sequence: 14,
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
