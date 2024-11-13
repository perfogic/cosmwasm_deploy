import { Contract, getMnemonic, loadContract } from '../helpers/utils';
import { connect } from '../helpers/connect';
import { uploadContracts } from '../helpers/contract';
import { InstantiateMsg } from '../../bindings/RefundBtc.types';
import { RefundBtcClient } from '../../bindings/RefundBtc.client';
import { OraichainConfig, WasmLocalConfig } from '../constants/networks';
import { USDT_CONTRACT } from '@oraichain/oraidex-common';

const contracts: Contract[] = [
  {
    name: 'refund_btc',
    wasmFile: './contracts/refund-btc.wasm',
  },
];

// contract: orai1jw8lwsswarqu526y7eld94t40t70n6cn6ap0y8xvrkns8an94n4qkc532y
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  // upload contract
  // const codeId = await uploadContracts(client, address, contracts);

  // const tx = await client.instantiate(address, codeId.refund_btc, {}, 'refund-btc-test', 'auto', {
  //   admin: address,
  // });
  // console.log(tx.contractAddress);
  // const tx = await client.migrate(
  //   address,
  //   'orai1jw8lwsswarqu526y7eld94t40t70n6cn6ap0y8xvrkns8an94n4qkc532y',
  //   codeId.refund_btc,
  //   {},
  //   'auto'
  // );
  // console.log(tx.transactionHash);

  let contractClient = new RefundBtcClient(
    client,
    address,
    'orai1c4lm5luwfx3078k5uqt6lg8xgawz9v4vaafhtz7xnn2e96ndhmdsqq8gd6'
  );

  // let tx = await client.sendTokens(
  //   address,
  //   'orai1c4lm5luwfx3078k5uqt6lg8xgawz9v4vaafhtz7xnn2e96ndhmdsqq8gd6',
  //   [
  //     {
  //       denom: 'orai',
  //       amount: '1000',
  //     },
  //   ],
  //   'auto'
  // );
  // console.log(tx.transactionHash);

  let tx = (await client.execute(
    address,
    USDT_CONTRACT,
    {
      transfer: {
        amount: '1000',
        recipient: 'orai1c4lm5luwfx3078k5uqt6lg8xgawz9v4vaafhtz7xnn2e96ndhmdsqq8gd6',
      },
    },
    'auto'
  )) as any;
  console.log(tx.transactionHash);

  // const tx = await contractClient.addRewarder({
  //   rewarder: 'orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd',
  //   rewards: [
  //     {
  //       amount: '1000',
  //       info: {
  //         native_token: {
  //           denom: 'orai',
  //         },
  //       },
  //     },
  //     // {
  //     //   amount: '1000',
  //     //   info: {
  //     //     native_token: {
  //     //       denom: 'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc',
  //     //     },
  //     //   },
  //     // },
  //     {
  //       amount: '1000',
  //       info: {
  //         token: {
  //           contract_addr: USDT_CONTRACT,
  //         },
  //       },
  //     },
  //   ],
  // });

  // console.log(`Tx hash: ${tx.transactionHash}`);
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
