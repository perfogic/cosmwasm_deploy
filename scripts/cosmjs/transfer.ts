import { OraichainConfig } from '../constants/networks';
import { connect } from '../helpers/connect';
import { getMnemonic } from '../helpers/utils';
import { TokenfactoryClient } from '../../bindings';

const main = async () => {
  const mnemonic = getMnemonic();
  const { client, address } = await connect(mnemonic, OraichainConfig);

  const tokenFactoryContract = new TokenfactoryClient(
    client,
    address,
    'orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9'
  );

  const tx = await tokenFactoryContract.createDenom({
    subdenom: 'ugoat',
    metadata: {
      name: 'Goatseus Maximus',
      description: 'The most beautiful goatseus in the world',
      denom_units: [],
      base: 'ugoat',
      display:
        'https://assets.coingecko.com/coins/images/35160/standard/logo-light1.png?1707569994',
      symbol: 'GOAT',
    },
  });

  console.log(`Create denom tx ${tx.transactionHash}`);

  const tx1 = await tokenFactoryContract.mintTokens({
    amount: '1000000000000000000',
    denom: 'goatseus-maximus',
    mintToAddress: 'orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2',
  });
  console.log(`Mint tokens tx ${tx1.transactionHash}`);

  // const tx = await client.sendTokens(
  //   address,
  //   'orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2',
  //   [
  //     {
  //       denom: 'factory/orai17hyr3eg92fv34fdnkend48scu32hn26gqxw3hnwkfy904lk9r09qqzty42/XuanDang',
  //       amount: '1296757953000',
  //     },
  //   ],
  //   'auto'
  // );
  // console.log(`Send tokens at tx ${tx.transactionHash}`);
};

main();
