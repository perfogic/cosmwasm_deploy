import { Contract, getMnemonic, loadContract } from "../helpers/utils";
import { connect } from "../helpers/connect";
import { uploadContracts } from "../helpers/contract";
import { InstantiateMsg as epInstantiateMsg } from "../../bindings/EntryPoint.types";
import { InstantiateMsg as ihInstantiateMsg } from "../../bindings/IbcHooks.types";
import { WasmLocalConfig } from "../constants/networks";
import { EntryPointClient } from "../../bindings";

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

// Entrypoint contract: orai14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9savsjyw
// Ibchook contract orai1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrq3e4sxg
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
  console.log("Entrypoint contract:", entryPoint.contractAddress);

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

  console.log("Ibchook contract", ibcHooks.contractAddress);

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
