import {
  BufferCollection,
  compare,
  ContractInfo,
  DownloadState,
  SimulateCosmWasmClient,
  SortedMap,
} from "@oraichain/cw-simulate";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export async function loadCodeAndState(
  simulateClient: SimulateCosmWasmClient,
  contractAddress: string,
  path: string,
  info: ContractInfo
) {
  const code = readFileSync(path);
  const buffer = readFileSync(path + ".state");

  const { codeId } = await simulateClient.upload(
    info.admin!,
    new Uint8Array(code),
    "auto"
  );
  const state = SortedMap.rawPack(
    new BufferCollection(buffer as any) as any,
    compare
  );
  await simulateClient.loadContract(
    contractAddress,
    { ...info, codeId },
    state as any
  );
}

export async function downloadState(contract: string, downloadPath: string) {
  const downloadState = new DownloadState("https://lcd.orai.io", downloadPath);
  await downloadState.saveState(contract);
}

export function readWasmByteCode(dirname: string) {
  const wasmName = dirname.split("/").slice(-1)[0];
  return readFileSync(resolve(dirname, `data/${wasmName}.wasm`));
}

export function downloadWasmStateIfNotExist(
  dirname: string,
  contract: string,
  path = "data"
) {
  return async () => {
    if (!existsSync(resolve(dirname, path, contract))) {
      await downloadState(contract, resolve(dirname, path));
    }
  };
}
