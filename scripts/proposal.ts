import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraichainConfig, OraiBtcLocalConfig } from "./networks";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { coin } from "@cosmjs/stargate";
import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgUpdateAdmin } from "cosmjs-types/cosmwasm/wasm/v1/tx";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(mnemonic, OraichainConfig, true);

  const govMsg = {
    typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
    value: MsgSubmitProposal.fromPartial({
      content: {
        typeUrl: "/cosmwasm.wasm.v1.MsgChangeAdmin",
        value: MsgUpdateAdmin.encode({
          contract: "orai1ase8wkkhczqdda83f0cd9lnuyvf47465j70hyk",
          newAdmin: "orai1fs25usz65tsryf0f8d5cpfmqgr0xwup4kjqpa0",
          sender: address,
        }).finish(),
      },
      initialDeposit: [coin(10_000_000, "orai")],
      proposer: address,
    }),
  };

  const tx = await client.signAndBroadcast(address, [govMsg], "auto");
  console.log(tx.transactionHash);
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
