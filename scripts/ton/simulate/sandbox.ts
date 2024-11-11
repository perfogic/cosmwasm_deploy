import {
  Blockchain,
  printTransactionFees,
  SandboxContract,
  TreasuryContract,
  internal,
  prettyLogTransactions,
  RemoteBlockchainStorage,
  wrapTonClient4ForRemote,
} from '@ton/sandbox';
import {
  Address,
  beginCell,
  Sender,
  SenderArguments,
  toNano,
  TonClient4,
  WalletContractV4,
} from '@ton/ton';
import { getHttpV4Endpoint } from '@orbs-network/ton-access';
import { BridgeAdapter } from '@oraichain/ton-bridge-contracts';
import dotenv from 'dotenv';

dotenv.config();

const faucetUser = async (
  faucetor: SandboxContract<TreasuryContract>,
  receiver: Address,
  amount: bigint
) => {
  return faucetor.send({
    to: receiver,
    value: amount,
  });
};

const main = async () => {
  let blockchain = await Blockchain.create({
    storage: new RemoteBlockchainStorage(
      wrapTonClient4ForRemote(
        new TonClient4({
          endpoint: await getHttpV4Endpoint({
            network: 'mainnet',
          }),
        })
      )
    ),
  });
  blockchain.verbosity = {
    ...blockchain.verbosity,
  };
  let faucet = await blockchain.treasury('faucet');
  let sender = blockchain.sender(Address.parse('UQAW5Tsp2mMja-syAH_jw9j7a4dFICcaHHcq8xu0k-_YzpIW'));
  await faucetUser(faucet, sender.address!, toNano(100));
  console.log('Before execute balance:', (await blockchain.getContract(sender.address!)).balance);
  let bridgeAdapterContract = BridgeAdapter.createFromAddress(
    Address.parse('EQC-aFP0rJXwTgKZQJPbPfTSpBFc8wxOgKHWD9cPvOl_DnaY')
  );
  let bridgeAdapterAdapter = blockchain.openContract(bridgeAdapterContract);
  let beforeExecuteTime = new Date().getTime();
  const txResult = await bridgeAdapterAdapter.sendBridgeTon(
    sender,
    {
      amount: toNano(10),
      memo: beginCell().endCell(),
      remoteReceiver: 'orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd',
      timeout: BigInt(Math.floor(new Date().getTime() / 1000) + 3600),
    },
    {
      value: toNano(15),
      queryId: 0,
    }
  );
  let afterExecuteTime = new Date().getTime();
  prettyLogTransactions(txResult.transactions);
  // The simulate does not do a minus on the balance of sender => so we manually minus it.
  console.log(
    'After execute balance',
    (await blockchain.getContract(sender.address!)).balance - toNano(15)
  );
  console.log('Execution time:', (afterExecuteTime - beforeExecuteTime) / 1000);
};

main();
