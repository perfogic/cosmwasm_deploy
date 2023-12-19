import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connectINJ } from "./helpers/connect";
import { Cw20Coin, InstantiateMsg } from "../bindings/Cw20.types";
import {
  Network,
  getNetworkInfo,
  ChainInfo,
  NetworkEndpoints,
} from "@injectivelabs/networks";
import { uploadContractsInj } from "./helpers/uploadContracts";
import { getStdFee } from "@injectivelabs/utils";
import {
  BaseAccount,
  ChainRestAuthApi,
  MsgInstantiateContract,
  TxGrpcClient,
  createTransaction,
} from "@injectivelabs/sdk-ts";

const contracts: Contract[] = [
  {
    name: "cw20_base",
    wasmFile: "./contracts/cw20-base.wasm",
  },
];

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { privateKey, address } = await connectINJ(mnemonic);

  const network = getNetworkInfo(Network.TestnetSentry);

  const uploadContracts = await uploadContractsInj(
    privateKey,
    address,
    network,
    contracts
  );

  const pubKey = privateKey.toPublicKey().toBase64();
  const chainId = network.chainId;

  const chainRestAuthApi = new ChainRestAuthApi(network.rest);
  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(address);
  const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);

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

  /** Prepare the Transaction **/
  const { txRaw, signBytes } = createTransaction({
    pubKey,
    chainId,
    fee: getStdFee({
      gas: 5000000,
    }),
    message: msg,
    sequence: baseAccount.sequence,
    accountNumber: baseAccount.accountNumber,
  });
  const signature = await privateKey.sign(Buffer.from(signBytes));
  txRaw.signatures = [signature];
  const txService = new TxGrpcClient(network.grpc);

  const txResponse = await txService.broadcast(txRaw);
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
