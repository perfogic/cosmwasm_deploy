import { Contract, getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { osmosisConfig, oraiConfig } from "./networks";
import { hitFaucet } from "./helpers/hitFaucet";
import { uploadContracts } from "./helpers/uploadContracts";
import { initDao, initToken } from "./helpers/initContract";
import { DaoDaoCoreClient, DaoVotingCw20StakedClient } from "../bindings";

const contracts: Contract[] = [
  {
    name: "dao_contract",
    wasmFile: "./contracts/dao-dao-core.wasm",
  },
  {
    name: "cw20_base",
    wasmFile: "./contracts/cw20-base.wasm",
  },
  {
    name: "staking_contract",
    wasmFile: "./contracts/cw20-stake.wasm",
  },
  {
    name: "voting_contract",
    wasmFile: "./contracts/dao-voting-cw20-staked.wasm",
  },
  {
    name: "proposal_contract",
    wasmFile: "./contracts/dao-proposal-single.wasm",
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
  if (amount === "0") {
    console.warn("Not enough token. Call faucet!");
    await hitFaucet(address, osmosisConfig.feeToken, osmosisConfig.faucetUrl);

    let { amount } = await client.getBalance(address, osmosisConfig.feeToken);
    console.log(`New balance of address ${address}: ${amount}`);
  }

  console.log(DaoVotingCw20StakedClient);
  

  // upload contract
  const codeId = await uploadContracts(client, address, contracts);
  const contractId = {
    dao: codeId.dao_contract,
    cw20Base: codeId.cw20_base,
    staking: codeId.staking_contract,
    voting: codeId.voting_contract,
    proposal: codeId.proposal_contract,
  };

  // instantiate contract
  // const contractAddress = await initToken(client, address, codeId.cw20_base);
  const contractAddress = await initDao(client, address, contractId);
  console.log("Dao address: ", contractAddress);

  // create dao client
  const daoContract = new DaoDaoCoreClient(client, address, contractAddress);
  const votingAddr = await daoContract.votingModule();
  console.log("Voting address: ", votingAddr);
  console.log("Proposal address: ", await daoContract.proposalModules({}));

  const votingContract = new DaoVotingCw20StakedClient(
    client,
    address,
    votingAddr
  );
  console.log("Cw20 contract: ", await votingContract.tokenContract());
  console.log("Staking contract: ", await votingContract.stakingContract());
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
