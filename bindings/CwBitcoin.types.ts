export type Addr = string;
export interface InstantiateMsg {
  token_factory_addr: Addr;
}
export type ExecuteMsg = {
  update_bitcoin_config: {
    config: BitcoinConfig;
  };
} | {
  update_checkpoint_config: {
    config: CheckpointConfig;
  };
} | {
  update_header_config: {
    config: HeaderConfig;
  };
} | {
  relay_headers: {
    headers: WrappedHeader[];
  };
} | {
  relay_deposit: {
    btc_height: number;
    btc_proof: Binary;
    btc_tx: Binary;
    btc_vout: number;
    dest: Dest;
    sigset_index: number;
  };
};
export type Binary = string;
export type Dest = {
  address: Addr;
} | {
  ibc: IbcDest;
};
export interface BitcoinConfig {
  capacity_limit: number;
  emergency_disbursal_lock_time_interval: number;
  emergency_disbursal_max_tx_size: number;
  emergency_disbursal_min_tx_amt: number;
  fee_pool_reward_split: [number, number];
  fee_pool_target_balance: number;
  max_deposit_age: number;
  max_offline_checkpoints: number;
  max_withdrawal_amount: number;
  max_withdrawal_script_length: number;
  min_checkpoint_confirmations: number;
  min_confirmations: number;
  min_deposit_amount: number;
  min_withdrawal_amount: number;
  min_withdrawal_checkpoints: number;
  transfer_fee: number;
  units_per_sat: number;
}
export interface CheckpointConfig {
  emergency_disbursal_lock_time_interval: number;
  emergency_disbursal_max_tx_size: number;
  emergency_disbursal_min_tx_amt: number;
  fee_rate: number;
  max_age: number;
  max_checkpoint_interval: number;
  max_fee_rate: number;
  max_inputs: number;
  max_outputs: number;
  max_unconfirmed_checkpoints: number;
  min_checkpoint_interval: number;
  min_fee_rate: number;
  sigset_threshold: [number, number];
  target_checkpoint_inclusion: number;
  user_fee_factor: number;
}
export interface HeaderConfig {
  max_length: number;
  max_target: number;
  max_time_increase: number;
  min_difficulty_blocks: boolean;
  retarget_interval: number;
  retargeting: boolean;
  target_spacing: number;
  target_timespan: number;
  trusted_header: Binary;
  trusted_height: number;
}
export interface WrappedHeader {
  header: Binary;
  height: number;
}
export interface IbcDest {
  memo: string;
  source_channel: string;
  source_port: string;
  timeout_timestamp: number;
}
export type QueryMsg = {
  header_height: {};
} | {
  deposit_fees: {
    index?: number | null;
  };
} | {
  withdrawal_fees: {
    address: string;
    index?: number | null;
  };
} | {
  sidechain_block_hash: {};
} | {
  checkpoint_by_index: {
    index: number;
  };
};
export interface MigrateMsg {}
export type Uint64 = number;
export type Uint32 = number;
export type HexBinary = string;