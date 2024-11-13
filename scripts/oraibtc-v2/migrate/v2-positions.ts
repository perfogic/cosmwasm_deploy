import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { AssetInfo } from '@oraichain/common-contracts-sdk/build/CwIcs20Latest.types';
import { BigDecimal, REWARDER_CONTRACT, STAKING_CONTRACT } from '@oraichain/oraidex-common';

const RPC = 'http://3.14.142.99:26657';
const start = async () => {
  let snapshotHeight = 38869462; // 38869462
  const cosmwasm = await CosmWasmClient.connect(RPC);
  cosmwasm.setQueryClientWithHeight(snapshotHeight);
  const LIQUIDITY_ADDRESS = 'orai1jd9lc2qt0ltjsatgnu38xsz8ngp89clp0dpeh8geyjj70yvkn4kqmrmh3m';
  const PAIR_ADDRESS = 'orai1fv5kwdv4z0gvp75ht378x8cg2j7prlywa0g35qmctez9q8u4xryspn6lrd';
  let poolData = await cosmwasm.queryContractSmart(PAIR_ADDRESS, {
    pool: {},
  });
  let startAfter = undefined;
  let limit = 100;
  let allAccounts: any[] = [];
  while (true) {
    let { accounts } = await cosmwasm.queryContractSmart(LIQUIDITY_ADDRESS, {
      all_accounts: {
        start_after: startAfter,
        limit: limit,
      },
    });
    if (accounts.length === 0) {
      break;
    }
    allAccounts.push(...accounts);
    startAfter = accounts[accounts.length - 1];
  }
  let liquidityTokenInfo = await cosmwasm.queryContractSmart(LIQUIDITY_ADDRESS, {
    token_info: {},
  });
  let allBalances = await Promise.all(
    allAccounts.map((account) =>
      cosmwasm.queryContractSmart(LIQUIDITY_ADDRESS, {
        balance: {
          address: account,
        },
      })
    )
  );
  let rewards: any = await Promise.all(
    allAccounts.map((account) =>
      cosmwasm.queryContractSmart(STAKING_CONTRACT, {
        reward_info: {
          staking_token: LIQUIDITY_ADDRESS,
          staker_addr: account,
        },
      })
    )
  );
  console.dir(rewards.length, { depth: null });
  let stuckAccounts: { [key: string]: bigint } = {};

  if (allAccounts.length !== allBalances.length || allAccounts.length !== rewards.length) {
    throw new Error('Mismatch in accounts and balances');
  }

  let totalStuckedAmount = 0n;
  for (let i = 0; i < allAccounts.length; i++) {
    if (allAccounts[i] === STAKING_CONTRACT) {
      continue;
    }
    if (BigInt(allBalances[i].balance) > 0n) {
      totalStuckedAmount += BigInt(allBalances[i].balance);
      stuckAccounts[allAccounts[i]] = BigInt(allBalances[i].balance);
    }

    let filteredRewardInfos = rewards[i].reward_infos.filter(
      (item: any) => item.staking_token === LIQUIDITY_ADDRESS
    );
    if (filteredRewardInfos.length > 0) {
      let rewardInfo = filteredRewardInfos[0];
      if (BigInt(rewardInfo.bond_amount) > 0n) {
        totalStuckedAmount += BigInt(rewardInfo.bond_amount);
        if (stuckAccounts[allAccounts[i]] !== undefined) {
          console.log(
            'Adding to existing account',
            allAccounts[i],
            BigInt(allBalances[i].balance),
            BigInt(rewardInfo.bond_amount)
          );
          stuckAccounts[allAccounts[i]] += BigInt(rewardInfo.bond_amount);
        } else {
          stuckAccounts[allAccounts[i]] = BigInt(rewardInfo.bond_amount);
        }
      }
    }
  }

  let reserveTokenAmount: { [key: string]: any } = {};
  let totalShare = BigInt(poolData.total_share);
  for (const address of Object.keys(stuckAccounts)) {
    for (const asset of poolData.assets) {
      if (!reserveTokenAmount[address]) {
        reserveTokenAmount[address] = {};
      }
      let info = asset.info as AssetInfo;
      let amount = BigInt(asset.amount);
      let share = stuckAccounts[address];
      let shareInPool = (amount * share) / totalShare;

      if ('native_token' in info) {
        reserveTokenAmount[address] = {
          ...reserveTokenAmount[address],
          [info.native_token.denom]: shareInPool,
        };
      } else {
        reserveTokenAmount[address] = {
          ...reserveTokenAmount[address],
          [info.token.contract_addr]: shareInPool,
        };
      }
    }
  }

  console.dir(reserveTokenAmount, { depth: null });
};

start();
