// data from https://github.com/cosmos/chain-registry/tree/master/testnets
import { GasPrice } from "@cosmjs/stargate";

export interface Network {
  chainId: string;
  rpcEndpoint: string;
  prefix: string;
  gasPrice: GasPrice;
  feeToken: string;
  faucetUrl: string;
}

export const osmosisConfig: Network = {
  chainId: "osmo-test-5",
  rpcEndpoint: "https://rpc.testnet.osmosis.zone",
  prefix: "osmo",
  gasPrice: GasPrice.fromString("0.0025uosmo"),
  feeToken: "uosmo",
  faucetUrl: "https://faucet.testnet.osmosis.zone/",
};

export const oraiConfig: Network = {
  chainId: "Oraichain",
  rpcEndpoint: "https://rpc.orai.io",
  prefix: "orai",
  gasPrice: GasPrice.fromString("0.002orai"), 
  feeToken: "orai",
  faucetUrl: "https://faucet.orai.io/",
}

export const junoConfig: Network = {
  chainId: "uni-6",
  rpcEndpoint: "https://rpc.testnet.osmosis.zone",
  prefix: "osmo",
  gasPrice: GasPrice.fromString("0.0025uosmo"),
  feeToken: "uosmo",
  faucetUrl: "https://faucet.testnet.osmosis.zone/",
};