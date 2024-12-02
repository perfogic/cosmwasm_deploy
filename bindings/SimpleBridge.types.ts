export type Addr = string;
export interface InstantiateMsg {
  token_factory_addr?: Addr | null;
}
export type ExecuteMsg = {
  change_owner: {
    owner: Addr;
  };
} | {
  add_tx: {
    hash: string;
    value: TxInfo;
  };
} | {
  update_tx: {
    dest_hash: string;
    hash: string;
  };
} | {
  register_denom: {
    metadata?: Metadata | null;
    subdenom: string;
  };
};
export type Uint128 = string;
export interface TxInfo {
  amount: Uint128;
  destination_tx_hash: string;
  receiver: string;
  remote_denom: string;
  should_mint: boolean;
}
export interface Metadata {
  base?: string | null;
  denom_units: DenomUnit[];
  description?: string | null;
  display?: string | null;
  name?: string | null;
  symbol?: string | null;
}
export interface DenomUnit {
  aliases: string[];
  denom: string;
  exponent: number;
}
export type QueryMsg = {
  get_tx: {
    hash: string;
  };
} | {
  get_tx_status: {
    hash: string;
  };
} | {
  get_register_token_status: {
    subdenom: string;
  };
};
export interface MigrateMsg {}
export type Boolean = boolean;