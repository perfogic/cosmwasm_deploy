import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, isOfflineDirectSigner } from "@cosmjs/proto-signing";
import { Secp256k1HdWallet, makeCosmoshubPath } from "@cosmjs/amino";

import { Network } from "../networks";
import { PrivateKey } from "@injectivelabs/sdk-ts";

/**
 *
 * @param mnemonic
 * @param network
 * @returns
 **/
export async function connect(mnemonic: string, network: Network, offline: boolean = true) {
  const { prefix, gasPrice, feeToken, rpcEndpoint } = network;
  const hdPath = makeCosmoshubPath(0);

  // Setup signer

  let signer;
  let address;

  if (offline) {
    const offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix,
      hdPaths: [hdPath],
    });
    const { address: addr } = (await offlineSigner.getAccounts())[0];
    signer = offlineSigner;
    address = addr;
  }
  else {
    const onlineSigner = await Secp256k1HdWallet.fromMnemonic(mnemonic)
    const { address: addr } = (await onlineSigner.getAccounts())[0];
    signer = onlineSigner;
    address = addr;
  }

  // Init SigningCosmWasmClient client
  const client = await SigningCosmWasmClient.connectWithSigner(
    rpcEndpoint,
    signer,
    {
      gasPrice,
    }
  );

  return { client, address };
}

export const connectINJ = async (mnemonic: string) => {
  const privateKey = PrivateKey.fromMnemonic(mnemonic);
  const injectiveAddress = privateKey.toBech32();

  return {
    privateKey,
    address: injectiveAddress,
  };
};
