import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { makeCosmoshubPath } from "@cosmjs/amino";

import { Network } from "../networks";
import { PrivateKey } from "@injectivelabs/sdk-ts";

/**
 *
 * @param mnemonic
 * @param network
 * @returns
 **/
export async function connect(mnemonic: string, network: Network) {
  const { prefix, gasPrice, feeToken, rpcEndpoint } = network;
  const hdPath = makeCosmoshubPath(0);

  // Setup signer
  const offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix,
    hdPaths: [hdPath],
  });
  const { address } = (await offlineSigner.getAccounts())[0];
  console.log(`Connected to ${address}`);

  // Init SigningCosmWasmClient client
  const client = await SigningCosmWasmClient.connectWithSigner(
    rpcEndpoint,
    offlineSigner,
    {
      gasPrice,
    }
  );
  const balance = await client.getBalance(address, feeToken);
  console.log(`Balance: ${balance.amount} ${balance.denom}`);

  const chainId = await client.getChainId();
  console.log(chainId);

  if (chainId !== network.chainId) {
    throw Error("Given ChainId doesn't match the clients ChainID!");
  }

  return { client, address };
}

export const connectINJ = async (mnemonic: string) => {
  const privateKeyHash = PrivateKey.fromMnemonic(mnemonic).toPrivateKeyHex();
  const privateKey = PrivateKey.fromHex(privateKeyHash);
  const injectiveAddress = privateKey.toBech32();

  return {
    privateKey,
    address: injectiveAddress,
  };
};
