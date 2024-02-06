import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraichainConfig, OraiBtcLocalConfig } from "./networks";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";

async function main(): Promise<void> {
    // get the mnemonic
    const mnemonic = getMnemonic();

    const { client, address } = await connect(mnemonic, OraichainConfig, true);
    const addressData = fromBech32(address).data;
    const addressWithRightPrefix = toBech32(OraichainConfig.prefix, addressData);
    const dedstAddressWithRightPrefix = toBech32(OraiBtcLocalConfig.prefix, addressData);

    const timeoutTimestampSeconds = Math.floor((Date.now() + 60 * 60 * 1000) / 1000);
    const timeoutTimestampNanoseconds = Long.fromNumber(timeoutTimestampSeconds).multiply(1000000000)

    const ibcTransferMsg = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: {
            sourcePort: "transfer",
            sourceChannel: "channel-192",
            sender: addressWithRightPrefix,
            receiver: dedstAddressWithRightPrefix,
            token: {
              amount: 0, // amount in wei with denom 6
              denom: "", // denom on source chain
            },
            timeoutTimestamp: timeoutTimestampNanoseconds,
            memo: `withdraw:tb1qc6pw50rgq43vcznfzy5rgykgcdd9nkf26gk477`
        },
    };


    const result = await client.signAndBroadcast(
        address,
        [ibcTransferMsg],
        "auto",
      );

    console.log(result)
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
