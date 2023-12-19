// import { SigningCosmWasmClient } from "cosmwasm";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Contract, loadContract } from "./utils";
import {
  PrivateKey,
  MsgStoreCode,
  createTransaction,
  ChainRestAuthApi,
  BaseAccount,
  TxGrpcClient,
} from "@injectivelabs/sdk-ts";
import { ChainInfo, NetworkEndpoints } from "@injectivelabs/networks";
import { getStdFee } from "@injectivelabs/utils";

interface UploadResults {
  [name: string]: number;
}

interface UploadResultsINJ {
  [name: string]: string;
}

/**
 *
 * @param client
 * @param signer
 * @param contracts
 * @returns
 */
export async function uploadContracts(
  client: SigningCosmWasmClient,
  signer: string,
  contracts: Contract[]
): Promise<UploadResults> {
  const uploaded: UploadResults = {};
  for (const contract of contracts) {
    const wasm = await loadContract(contract);
    console.debug(`Uploading ${contract.name}...`);
    const receipt = await client.upload(signer, wasm, "auto");

    uploaded[contract.name] = receipt.codeId;
  }
  return uploaded;
}

export async function uploadContractsInj(
  privateKey: PrivateKey,
  signer: string,
  network: ChainInfo & NetworkEndpoints,
  contracts: Contract[]
): Promise<UploadResultsINJ> {
  const uploaded: UploadResultsINJ = {};
  for (const contract of contracts) {
    const wasm = await loadContract(contract);
    console.debug(`Uploading ${contract.name}...`);

    const pubKey = privateKey.toPublicKey().toBase64();
    const chainId = network.chainId;

    const chainRestAuthApi = new ChainRestAuthApi(network.rest);
    const accountDetailsResponse = await chainRestAuthApi.fetchAccount(signer);
    const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);

    const msg = MsgStoreCode.fromJSON({
      sender: signer,
      wasmBytes: wasm,
    });

    /** Prepare the Transaction **/
    const { txRaw, signBytes } = createTransaction({
      pubKey,
      chainId,
      fee: getStdFee({
        gas: 10000000,
      }),
      message: msg,
      sequence: baseAccount.sequence,
      accountNumber: baseAccount.accountNumber,
    });
    const signature = await privateKey.sign(Buffer.from(signBytes));
    txRaw.signatures = [signature];
    const txService = new TxGrpcClient(network.grpc);

    const txResponse = await txService.broadcast(txRaw);

    const codeId = JSON.parse(txResponse.rawLog)[0]
      .events.filter(
        (event: any) => event.type == "cosmwasm.wasm.v1.EventCodeStored"
      )[0]
      .attributes.filter((attribute: any) => attribute.key == "code_id")[0]
      .value as string;

    uploaded[contract.name] = codeId;
  }
  return uploaded;
}
