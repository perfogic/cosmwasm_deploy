import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraichainConfig, OraiBtcLocalConfig } from "./networks";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { coin } from "@cosmjs/stargate";
import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgUpdateAdmin } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Cosmos from "@oraichain/cosmosjs";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(mnemonic, OraichainConfig, false);
  const message = Cosmos.message;

  const createProposal = new message.cosmwasm.wasm.v1.UpdateAdminProposal({
    contract: "orai1ase8wkkhczqdda83f0cd9lnuyvf47465j70hyk",
    description: "A",
    new_admin: "orai1fs25usz65tsryf0f8d5cpfmqgr0xwup4kjqpa0",
    title: "B",
  });

  const createProposalMsgAny = new message.google.protobuf.Any({
    type_url: "/cosmwasm.wasm.v1.UpdateAdminProposal",
    value:
      message.cosmwasm.wasm.v1.UpdateAdminProposal.encode(
        createProposal
      ).finish(),
  });

  const govMsg = {
    typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
    value: MsgSubmitProposal.fromPartial({
      content: {
        typeUrl: createProposalMsgAny.type_url,
        value: createProposalMsgAny.value,
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
