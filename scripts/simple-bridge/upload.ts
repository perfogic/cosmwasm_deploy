import { Contract, getMnemonic, loadContract } from '../helpers/utils';
import { connect } from '../helpers/connect';
import { uploadContracts } from '../helpers/contract';
import { InstantiateMsg } from '../../bindings/SimpleBridge.types';
import { OraichainConfig, WasmLocalConfig } from '../constants/networks';
import { SimpleBridgeClient, SimpleBridgeInterface, TokenfactoryClient } from '../../bindings';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';

export const encodeNamespaces = (namespaces: Uint8Array[]): Uint8Array => {
  const ret = [];
  for (const ns of namespaces) {
    const lengthBuf = Buffer.allocUnsafe(2);
    lengthBuf.writeUInt16BE(ns.byteLength);
    ret.push(lengthBuf);
    ret.push(ns);
  }
  return Buffer.concat(ret);
};

const contracts: Contract[] = [
  {
    name: 'simple_bridge',
    wasmFile: './contracts/simple-bridge.wasm',
  },
];

// Light client bitcoin: orai1unyuj8qnmygvzuex3dwmg9yzt9alhvyeat0uu0jedg2wj33efl5qjs222y
// App bitcoin: orai1xt4ahzz2x8hpkc0tk6ekte9x6crw4w6u0r67cyt3kz9syh24pd7sxfqs0x
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  const tx = await client.sendTokens(
    address,
    'orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2',
    [
      {
        amount: '10000000',
        denom:
          'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h',
      },
    ],
    'auto',
    ''
  );
  console.log(`Send tokens at tx ${tx.transactionHash}`);

  // const simpleBridgeContract = new SimpleBridgeClient(
  //   client,
  //   address,
  //   'orai1tz9x4fe8mvs0zj99jnadkge5j7qqhy9478guwty8e80vzygwd6hq9f5d9l'
  // );
  // const tx = await simpleBridgeContract.changeOwner({
  //   owner: 'orai1ym6qytsu7skv2flw89y0mkey4gn7wl9q4y6r5p',
  // });
  // console.log('Change owner tx', tx.transactionHash);

  // const tx = await client.updateAdmin(
  //   address,
  //   'orai1tz9x4fe8mvs0zj99jnadkge5j7qqhy9478guwty8e80vzygwd6hq9f5d9l',
  //   'orai1wn0qfdhn7xfn7fvsx6fme96x4mcuzrm9wm3mvlunp5e737rpgt4qndmfv8',
  //   2.0
  // );
  // console.log(`Update admin at tx ${tx.transactionHash}`);

  // const data = await client.queryContractRaw(
  //   'orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9',
  //   Buffer.concat([
  //     encodeNamespaces([Buffer.from('denom_owner') as any]),
  //     Buffer.from(
  //       'factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h'
  //     ),
  //   ])
  // );
  // console.log(Buffer.from(data!).toString('utf-8'));
  // console.log(address);
  // console.log(Buffer.from(data!).toString('utf-8'));

  // upload contract
  // const codeId = await uploadContracts(client, address, contracts);
  // const contractId = {
  //   simpleBridge: codeId.simple_bridge,
  // };

  // const tx = await client.migrate(
  //   address,
  //   'orai1tz9x4fe8mvs0zj99jnadkge5j7qqhy9478guwty8e80vzygwd6hq9f5d9l',
  //   contractId.simpleBridge,
  //   {},
  //   'auto'
  // );
  // console.log(`Migrate at tx ${tx.transactionHash}`);

  // const simpleBridgeMsg: InstantiateMsg = {
  //   token_factory_addr: 'orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9',
  // };

  // const simpleBridgeContract = await client.instantiate(
  //   address,
  //   contractId.simpleBridge,
  //   simpleBridgeMsg,
  //   'orai <-> sol bridge contract',
  //   'auto',
  //   {
  //     admin: address,
  //   }
  // );

  // console.log(simpleBridgeContract.contractAddress);
}

main();
