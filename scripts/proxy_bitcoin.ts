import { Contract, getMnemonic, loadContract } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraichainConfig } from "./networks";
import { ProxyBitcoinQueryClient } from "../bindings";

// mainnet: orai1plhnld6489hpxay9wfel8mp39esw625pnufq03p9tg0d8u60987s99l7z6
// testnet: orai16qnhuc5jpp4h322ju4ass3z05hw2du0e9k5t5knzwcqyjr3rmzrsa8s5ag
async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);

  // upload contract
  const contract = new ProxyBitcoinQueryClient(
    client,
    "orai10500dwnen8n8vlnsdn8u6sau32s5jxwegzg2fx69sdwpqy3mxd0s79rakn"
  );
  const result = await contract.validatorInfo({
    valAddr: "oraivaloper1q0jn956hpvmlzckdcwfehy26yz03hqvk7gg4es",
  });
  console.log({
    result,
  });
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
