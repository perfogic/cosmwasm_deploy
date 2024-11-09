import * as btc from "bitcoinjs-lib";

export function bech32toScriptPubKey(a: string): Buffer {
  const z = btc.address.fromBech32(a);
  return btc.script.compile([
    btc.script.number.encode(z.version),
    btc.address.fromBech32(a).data,
  ]);
}

export function legacyToScriptPubKey(address: string): Buffer {
  const { hash } = btc.address.fromBase58Check(address); // Giải mã địa chỉ legacy (P2PKH)
  return btc.script.compile([
    btc.opcodes.OP_DUP,
    btc.opcodes.OP_HASH160,
    hash,
    btc.opcodes.OP_EQUALVERIFY,
    btc.opcodes.OP_CHECKSIG,
  ]);
}
