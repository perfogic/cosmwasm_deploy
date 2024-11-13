import { BigDecimal } from '@oraichain/oraidex-common';
import { Cw20Client } from '../../../bindings';
import { OraichainConfig } from '../../constants/networks';
import { connect } from '../../helpers/connect';
import { getMnemonic } from '../../helpers/utils';

const getAllAccounts = async () => {
  let mnemonic = getMnemonic();
  const { client, address } = await connect(mnemonic, OraichainConfig, true);
  let OBTC20_CONTRACT = 'orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd';
  let cw20Contract = new Cw20Client(client, address, OBTC20_CONTRACT);
  console.log('token info:', await cw20Contract.tokenInfo());
  let startAfter: string | undefined = undefined;
  let limit = 100;
  let allAccounts: any[] = [];
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

  let snapshotAccounts: any[] = [];
  let total = 0n;
  for (let i = 0; i < allAccounts.length; i++) {
    if (BigInt(allBalances[i].balance) > 0n && BigInt(allBalances[i].balance) < 28000000n) {
      snapshotAccounts.push(allAccounts[i]);
      total += BigInt(allBalances[i].balance);
      console.log(
        allAccounts[i],
        // "- Raw amount: ",
        // BigInt(allBalances[i].balance) * 10n ** 8n, // Cast to bigint
        '- BTC amount: ',
        new BigDecimal(BigInt(allBalances[i].balance) * 10n ** 8n)
          .div(new BigDecimal(10n ** 14n))
          .toString(),
        'BTC'
      );
    }
  }
  console.log('Total amount', new BigDecimal(total).div(new BigDecimal(10n ** 6n)).toString());
};

getAllAccounts();
