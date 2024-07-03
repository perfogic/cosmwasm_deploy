import { getMnemonic } from "./helpers/utils";
import { connect } from "./helpers/connect";
import { OraichainConfig, OraiBtcLocalConfig } from "./networks";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";

async function main(): Promise<void> {
  // get the mnemonic
  const mnemonic = getMnemonic();

  const { client, address } = await connect(mnemonic, OraichainConfig, true);

  const sendMsg1 = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: address,
      toAddress:
        "orai195269awwnt5m6c843q6w7hp8rt0k7syfu9de4h0wz384slshuzps8y7ccm",
      amount: [
        {
          denom: OraichainConfig.feeToken,
          amount: "20000",
        },
      ],
    },
  };

  const memo = `
  x{8002DCA7653B4C646D7D66400FFC787B1F6D70E8A404E3438EE55E6376927DFB19D003A9D3907EA86719A223699FAA746F9ED9EC9A2E4A290ECAF0B8CCDEDE5212D48000000000000000000000000002625A02_}
     x{34653534356634}
     x{FF00F4A413F4BCF2C80B}
      x{62_}
       x{CC}
        x{D4_}
         x{0831C02497C138007434C0C05C6C2544D7C0FC02F83E903E900C7E800C5C75C87E800C7E800C1CEA6D0000B4C7E08403E29FA954882EA54C4D167C0238208405E3514654882EA58C511100FC02780D60841657C1EF2EA4D67C02B817C12103FCBC2_}
         x{3E910C1C2EBCB8536_}
        x{4}
         x{2_}
          x{00F4CFFE803E90087C007B51343E803E903E90350C144DA8548AB1C17CB8B04A30BFFCB8B0950D109C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C032483E401C1D3232C0B281F2FFF274013E903D010C7E800835D270803CB8B11DE0063232C1540233C59C3E8085F2DAC4F32_}
           x{8210178D4519C8CB1F19CB3F5007FA0222CF165006CF1625FA025003CF16C95005CC2391729171E25008A813A08208E4E1C0AA008208989680A0A014BCF2E2C504C98040FB001023C85004FA0258CF1601CF16CCC9ED54}
          x{3B51343E803E903E90350C0234CFFE80145468017E903E9014D6F1C1551CDB5C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C0327E401C1D3232C0B281F2FFF274140371C1472C7CB8B0C2BE80146A2860822625A020822625A004AD8228608239387028062849F8C3C975C2C070C008E_}
           x{5279A018A182107362D09CC8CB1F5230CB3F58FA025007CF165007CF16C9718010C8CB0524CF165006FA0215CB6A14CCC971FB0010241023}
           x{10491038375F04}
           x{C200B08E218210D53276DB708010C8CB055008CF165004FA0216CB6A12CB1F12CB3FC972FB0093356C21E203C85004FA0258CF1601CF16CCC9ED54}
         x{2_}
          x{3B51343E803E903E90350C01F4CFFE803E900C145468549271C17CB8B049F0BFFCB8B0A0823938702A8005A805AF3CB8B0E0841EF765F7B232C7C572CFD400FE8088B3C58073C5B25C60063232C14933C59C3E80B2DAB33260103EC01004F214013E809633C58073C5B3327B552_}
          x{200835C87B51343E803E903E90350C0134C7E08405E3514654882EA0841EF765F784EE84AC7CB8B174CFCC7E800C04E81408F214013E809633C58073C5B3327B552_}
       x{A0F605DA89A1F401F481F481A861_}
     x{6F726169317263686E6B647073787A687175753633793672346A34743537706E6339773865686468656478}
  `;

  const result = await client.execute(
    address,
    "orai195269awwnt5m6c843q6w7hp8rt0k7syfu9de4h0wz384slshuzps8y7ccm",
    sendMsg1,
    200000,
    memo
  );

  console.log(result);
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
