import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraiBtcLocalConfig, OraiBtcMainnetConfig } from "./networks";
import { AminoMsg, coin, makeStdTx, StdFee } from "@cosmjs/amino";
import { Type, Field } from "protobufjs";
import { fromBech32, normalizeBech32, toBase64, toBech32 } from "@cosmjs/encoding";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { makeSignDoc } from "@cosmjs/amino";
import { Secp256k1HdWallet } from "@cosmjs/amino";


async function main(): Promise<void> {
    // get the mnemonic
    const mnemonic = getMnemonic();

    const { client, address, signer } = await connect(mnemonic, OraiBtcMainnetConfig, false);

    const addressData = fromBech32(address).data;
    const addressWithRightPrefix = toBech32(OraiBtcMainnetConfig.prefix, addressData)
    const setRecoveryAddressMsg = {
        typeUrl: "nomic/MsgSetRecoveryAddress",
        value: {
            recovery_address: "bc1q3f0nnnyllaj2gqm6qnuejdanmczkh0l8d58r3s",
        },
    };

    const MsgSetRecoveryAddressOriginal = new Type("MsgSetRecoveryAddress").add(new Field("recovery_address", 1, "string"));
    const bytes = MsgSetRecoveryAddressOriginal.encode(
        setRecoveryAddressMsg.value
    ).finish()
    console.log("Decode:", MsgSetRecoveryAddressOriginal.decode(bytes))
    client.registry.register(setRecoveryAddressMsg.typeUrl, MsgSetRecoveryAddressOriginal)

    const setRecoveryAddressAmino = {
        type: setRecoveryAddressMsg.typeUrl,
        value: setRecoveryAddressMsg.value
    } as AminoMsg


    const signDoc = makeSignDoc([setRecoveryAddressAmino], {
        amount: [coin("0", OraiBtcMainnetConfig.feeToken)],
        gas: "0",
    } as StdFee,
        OraiBtcMainnetConfig.chainId,
        "",
        0,
        1,
        undefined
    )

    console.log("Setting recovery address on ", addressWithRightPrefix)
    const { signature } = await (signer as Secp256k1HdWallet).signAmino(address, signDoc)

    const tx = makeStdTx(signDoc,
        signature
    );
    const tmClient = await Tendermint37Client.connect(OraiBtcMainnetConfig.rpcEndpoint);

    const result = await tmClient.broadcastTxSync({ tx: Uint8Array.from(Buffer.from(JSON.stringify(tx))) });

    console.log("Hello", result)
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
