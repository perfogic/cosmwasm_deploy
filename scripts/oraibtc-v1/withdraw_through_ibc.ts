import { getMnemonic } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { OraichainConfig, OraiBtcLocalConfig } from "../constants/networks";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";

async function main(): Promise<void> {
  try {
    const mnemonic = getMnemonic();

    const { client, address } = await connect(mnemonic, OraichainConfig, true);
    const addressData = fromBech32(address).data;
    const addressWithRightPrefix = toBech32(
      OraichainConfig.prefix,
      addressData
    );
    const dedstAddressWithRightPrefix = toBech32(
      OraiBtcLocalConfig.prefix,
      addressData
    );

    const timeoutTimestampSeconds = Math.floor(
      (Date.now() + 5 * 60 * 1000) / 1000
    );
    const timeoutTimestampNanoseconds = Long.fromNumber(
      timeoutTimestampSeconds
    ).multiply(1000000000);

    const ibcTransferMsg = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: {
        sourcePort: "transfer",
        sourceChannel: "channel-238",
        sender: addressWithRightPrefix,
        receiver: dedstAddressWithRightPrefix,
        token: {
          amount: 5000, // amount in wei with denom 6
          denom:
            "ibc/BC8F7A914A05DAD46D7A5411D54891DD5DB99D1124A8FD3A056B889DFD95F124", // denom on source chain
        },
        timeoutTimestamp: timeoutTimestampNanoseconds,
        memo: `withdraw:tb1qc6pw50rgq43vcznfzy5rgykgcdd9nkf26gk477`,
      },
    };

    console.log(ibcTransferMsg);

    const result = await client.signAndBroadcast(
      addressWithRightPrefix,
      [ibcTransferMsg],
      "auto"
    );
    console.log(result);
  } catch (err) {
    console.log(err);
  }

  // console.log(result);
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
