import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { uploadContracts } from "./helpers/contract";
import { InstantiateMsg as epInstantiateMsg } from "../bindings/EntryPoint.types";
import { InstantiateMsg as ihInstantiateMsg } from "../bindings/IbcHooks.types";
import { WasmLocalConfig } from "./networks";
import { EntryPointClient } from "../bindings";

const contracts: Contract[] = [
  {
    name: "skip_api_entry_point",
    wasmFile: "./contracts/skip-api-entry-point.wasm",
  },
  {
    name: "skip_api_ibc_adapter_ibc_hooks",
    wasmFile: "./contracts/skip-api-ibc-adapter-ibc-hooks.wasm",
  },
];

// entry point: orai1szpf5jc26fsqv367cevuu2u6uwlffnnsq3q6qgjxtvlgacn96hxq8m32x4
// ibc hook: orai13hwesez4s6l6g0snvdm8e5cfunfya36v3n6qera6pxjv2yyy89mqk8d6g6
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, WasmLocalConfig);

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    skipApiEntryPoint: codeId.skip_api_entry_point,
    skipApiIbcAdapterIbcHooks: codeId.skip_api_ibc_adapter_ibc_hooks,
  };

  const entryPoint = await client.instantiate(
    address,
    contractId.skipApiEntryPoint,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {} as epInstantiateMsg,
    "entry point test",
    "auto",
    {
      admin: address,
    }
  );
  console.log(entryPoint.contractAddress);

  const ibcHooks = await client.instantiate(
    address,
    contractId.skipApiIbcAdapterIbcHooks,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
      entry_point_contract_address: entryPoint.contractAddress,
    } as ihInstantiateMsg,
    "ibc hooks test",
    "auto",
    {
      admin: address,
    }
  );

  console.log(ibcHooks.contractAddress);

  const entryPointClient = new EntryPointClient(
    client,
    address,
    entryPoint.contractAddress
  );
  const tx = await entryPointClient.updateConfig({
    ibcTransferContractAddress: ibcHooks.contractAddress,
  });
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
