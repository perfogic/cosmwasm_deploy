export interface InstantiateMsg {}
export type ExecuteMsg = string;
export type QueryMsg = {
  validator_info: {
    val_addr: string;
  };
};
export type MigrateMsg = string;
export type NullableValidatorInfo = ValidatorInfo | null;
export type Uint128 = string;
export interface ValidatorInfo {
  consensus_pubkey?: number[] | null;
  jailed: boolean;
  operator_address: string;
  status: number;
  tokens: Uint128;
}