import { Cw20Client } from "../../../bindings";
import { OraichainConfig } from "../../constants/networks";
import { connect } from "../../helpers/connect";
import { getMnemonic } from "../../helpers/utils";

const getAllAccounts = async () => {
  let mnemonic = getMnemonic();
  const { client, address } = await connect(mnemonic, OraichainConfig, true);
  let OBTC20_CONTRACT =
    "orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd";
  let cw20Contract = new Cw20Client(client, address, OBTC20_CONTRACT);
  console.log("token info:", await cw20Contract.tokenInfo());
  let startAfter = undefined;
  let limit = 100;
  let allAccounts = [];
  while (true) {
    let { accounts } = await cw20Contract.allAccounts({ startAfter, limit });
    if (accounts.length === 0) {
      break;
    }
    allAccounts.push(...accounts);
    startAfter = accounts[accounts.length - 1];
  }
  let allBalances = await Promise.all(
    allAccounts.map((account) => cw20Contract.balance({ address: account }))
  );

  let total = allBalances
    .filter(
      (balance) =>
        BigInt(balance.balance) > 0n && BigInt(balance.balance) <= 100000n
    )
    .reduce((acc, balance) => acc + BigInt(balance.balance), 0n);

  console.log({ total });
  // let snapshotAccounts = [];
  // for (let i = 0; i < allAccounts.length; i++) {
  //   if (BigInt(allBalances[i].balance) > 0n) {
  //     snapshotAccounts.push(allAccounts[i]);
  //     console.log(allAccounts[i], allBalances[i]);
  //   }
  // }
  // console.log({ snapshotAccounts });
};

getAllAccounts();
