import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraiBtcLocalConfig } from "./networks";
import { coin, StdFee } from "@cosmjs/amino";
// import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Type, Field } from "protobufjs";

async function main(): Promise<void> {
    // get the mnemonic
    const mnemonic = getMnemonic();

    const { client, address } = await connect(mnemonic, OraiBtcLocalConfig, true);

    const setRecoveryAddressMsg = {
        typeUrl: "nomic/MsgSetRecoveryAddress",
        value: {
            recovery_address: "tb1qc6pw50rgq43vcznfzy5rgykgcdd9nkf26gk477",
        },
    };

    const MsgSetRecoveryAddressOriginal = new Type("MsgSetRecoveryAddress").add(new Field("recovery_address", 1, "string"));
    const bytes = MsgSetRecoveryAddressOriginal.encode(
        setRecoveryAddressMsg.value
    ).finish()
    console.log("Decode:", MsgSetRecoveryAddressOriginal.decode(bytes))
    client.registry.register(setRecoveryAddressMsg.typeUrl, MsgSetRecoveryAddressOriginal)

    const txRaw = await client.sign(
        address,
        [setRecoveryAddressMsg],
        {
          amount: [coin("0", OraiBtcLocalConfig.feeToken)],
          gas: "0",
        } as StdFee,
        "",
        {
          accountNumber: 0,
          chainId: OraiBtcLocalConfig.chainId,
          sequence: 4
        }
      );

      const txBytes = TxRaw.encode(txRaw).finish()
      const txData = await client.broadcastTx(txBytes)
      console.log(txData)
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
