import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraiBtcLocalConfig } from "./networks";
import { AminoMsg, coin, makeStdTx, StdFee } from "@cosmjs/amino";
import { Type, Field } from "protobufjs";
import { fromBech32, normalizeBech32, toBase64, toBech32 } from "@cosmjs/encoding";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { makeSignDoc } from "@cosmjs/amino";
import { Secp256k1HdWallet } from "@cosmjs/amino";


async function main(): Promise<void> {
    // get the mnemonic
    const mnemonic = getMnemonic();

    const { client, address, signer } = await connect(mnemonic, OraiBtcLocalConfig, false);

    const addressData = fromBech32(address).data;
    const addressWithRightPrefix = toBech32(OraiBtcLocalConfig.prefix, addressData)
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

    const setRecoveryAddressAmino = {
        type: setRecoveryAddressMsg.typeUrl,
        value: setRecoveryAddressMsg.value
    } as AminoMsg


    const signDoc = makeSignDoc([setRecoveryAddressAmino], {
        amount: [coin("0", OraiBtcLocalConfig.feeToken)],
        gas: "0",
    } as StdFee,
        OraiBtcLocalConfig.chainId,
        "",
        0,
        11,
        undefined
    )

    console.log("Setting recovery address on ", addressWithRightPrefix)
    const { signature } = await (signer as Secp256k1HdWallet).signAmino(address, signDoc)

    const tx = makeStdTx(signDoc,
        signature
    );
    const tmClient = await Tendermint37Client.connect(OraiBtcLocalConfig.rpcEndpoint);

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
