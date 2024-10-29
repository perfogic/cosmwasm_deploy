import { Contract, getMnemonic } from "../helpers/utils";
import { connectINJ } from "../helpers/connect";
import { Cw20Coin, InstantiateMsg } from "../../bindings/Cw20.types";
import { Network, getNetworkInfo } from "@injectivelabs/networks";
import { executeTransaction, uploadContractsInj } from "../helpers/contract";
import { MsgInstantiateContract } from "@injectivelabs/sdk-ts";

const contracts: Contract[] = [
  {
    name: "cw20_base",
    wasmFile: "./contracts/cw20-base.wasm",
  },
];

async function main(): Promise<void> {
  const mnemonic = getMnemonic();
  const { privateKey, address } = await connectINJ(mnemonic);

  const network = getNetworkInfo(Network.TestnetSentry);
  console.log(network);

  const uploadContracts = await uploadContractsInj(
    privateKey,
    address,
    network,
    contracts
  );

  const initial_balances: Cw20Coin[] = [{ address, amount: "1000000000" }];
  const initMsg: InstantiateMsg = {
    name: "Test Token",
    symbol: "TTOKEN",
    decimals: 6,
    initial_balances,
    mint: {
      minter: address,
    },
  };

  const msg = MsgInstantiateContract.fromJSON({
    codeId: uploadContracts.cw20_base as any,
    admin: address,
    label: "Our Cw20",
    msg: initMsg,
    sender: address,
  });

  const txResponse = await executeTransaction(privateKey, network, msg);
  console.log(txResponse);
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
