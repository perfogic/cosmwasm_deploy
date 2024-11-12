import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { BigDecimal } from "@oraichain/oraidex-common";

const RPC = "http://3.14.142.99:26657";
const E14 = 10n ** 14n;
const E8 = 10n ** 8n;
const E6 = 10n ** 6n;
const start = async () => {
  let snapshotHeight = 38869462;
  const cosmwasm = await CosmWasmClient.connect(RPC);
  cosmwasm.setQueryClientWithHeight(snapshotHeight);
  console.log(
    await cosmwasm.getBalance(
      "orai1fv5kwdv4z0gvp75ht378x8cg2j7prlywa0g35qmctez9q8u4xryspn6lrd",
      "orai"
    )
  );
  // let OBTC20_CONTRACT =
  //   "orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd";

  // let tokenInfo = await cosmwasm.queryContractSmart(OBTC20_CONTRACT, {
  //   token_info: {},
  // });
  // console.log("Token info:", tokenInfo);

  // let startAfter = undefined;
  // let limit = 100;
  // let allAccounts = [];
  // while (true) {
  //   let { accounts } = await cosmwasm.queryContractSmart(OBTC20_CONTRACT, {
  //     all_accounts: {
  //       start_after: startAfter,
  //       limit: limit,
  //     },
  //   });
  //   if (accounts.length === 0) {
  //     break;
  //   }
  //   allAccounts.push(...accounts);
  //   startAfter = accounts[accounts.length - 1];
  // }
  // let allBalances = await Promise.all(
  //   allAccounts.map((account) =>
  //     cosmwasm.queryContractSmart(OBTC20_CONTRACT, {
  //       balance: {
  //         address: account,
  //       },
  //     })
  //   )
  // );

  // let snapshotAccounts = [];
  // let total = 0n;
  // let sendObj: { [key: string]: bigint } = {};
  // for (let i = 0; i < allAccounts.length; i++) {
  //   if (
  //     BigInt(allBalances[i].balance) > 0n &&
  //     BigInt(allBalances[i].balance) < 28000000n
  //   ) {
  //     snapshotAccounts.push(allAccounts[i]);
  //     total += BigInt(allBalances[i].balance);
  //     console.log(
  //       allAccounts[i],
  //       // "- Raw amount: ",
  //       // BigInt(allBalances[i].balance) * E8, // Cast to bigint
  //       "- BTC amount: ",
  //       new BigDecimal(BigInt(allBalances[i].balance) * E8)
  //         .div(new BigDecimal(E14))
  //         .toString(),
  //       "BTC"
  //     );
  //     sendObj[allAccounts[i]] = BigInt(allBalances[i].balance) * E8;
  //   }
  // }
  // console.log(
  //   "Total amount",
  //   new BigDecimal(total).div(new BigDecimal(E6)).toString()
  // );
  // console.log(sendObj);
};

start();
