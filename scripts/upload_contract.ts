import { Contract, getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { osmosisConfig } from "./networks";
import { hitFaucet } from "./helpers/hitFaucet";
import { uploadContracts } from "./helpers/uploadContracts";
import { initToken } from "./helpers/initToken";

const contracts: Contract[] = [
  {
    name: "cw20_base",
    wasmFile: "./contracts/cw20_base.wasm",
  },
];

async function main(): Promise<void> {
  // get the mnemonic 
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, osmosisConfig);

  // check that the given wallet has enough balance
  let { amount } = await client.getBalance(address, osmosisConfig.feeToken);

  // if not enough balance then call faucet
  if (amount === '0') {
    console.warn("Not enough token. Call faucet!");
    await hitFaucet(address, osmosisConfig.feeToken, osmosisConfig.faucetUrl);

    let { amount } = await client.getBalance(address, osmosisConfig.feeToken);
    console.log(`New balance of address ${address}: ${amount}`);
  }

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);

  // instantiate contract
  const contractAddress = await initToken(client, address, codeId.cw20_base);
  console.log("Contract address: ", contractAddress);
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
