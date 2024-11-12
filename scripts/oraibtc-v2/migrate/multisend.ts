import { coin } from "@cosmjs/amino";
import { OraichainConfig } from "../../constants/networks";
import { connect } from "../../helpers/connect";
import { getMnemonic } from "../../helpers/utils";

// const CONVERT_USERS: { [key: string]: bigint } = {
//   orai100yksgejc7dzefv73hvfkfhg3shdnhepphsj7g: 400000000n,
//   orai10a3czfrsukyuglgcu3c6zrngut7qtq4waxu0gl: 7664300000000n,
//   orai10caqvnvd3kh0s95a3m4dfrewytmnynnlj6ylaa: 510100000000n,
//   orai10l7fjc5hvmwclc5q8h47xapurkywgsyfjzhljk: 1000000000n,
//   orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a:
//     141700000000n,
//   orai12exmvuq6puaukwxmuy3klpvl65s4cks6qrknn7: 921700000000n,
//   orai13fyrv9huq880vkc3unl45grn2klgt5qqcufcy6: 400000000n,
//   orai13t55xvvj2uzpxq227ssgwu6gs9ctfrjcmzarhy: 2381200000000n,
//   orai14e04xex0yg635r46u36l2l320t980xdhq8zd36: 200000000n,
//   orai14fln20speqh7yfsmz4gshq6nvscach0l6uwpmr: 20000000000n,
//   orai14pf597q2ux8cchwuke3aqf3gn43pqj5vm3qqz6: 797800000000n,
//   orai14xxn6p34mjy3kusqq7k26gxdh4d2zdrrtjw7nn: 42800000000n,
//   orai150xqg2qqfaxxfyjjpcmsfwzzhvqq3q8d2uvvr2: 1700000000n,
//   orai152ppjq0sr2zyk5ng0wqvm0lv22xfgpa4mw80ua: 7900000000n,
//   orai165558z7ue9frsvzh8t0wg574wfl74l3m5mng0u: 100000000n,
//   orai1729l7cdsh26hvf8clx7c3wxhpgh2a958pt0nzp: 200000000n,
//   orai17gkegfxxzut39tmamgz4dfm4lceya02z9t7afs: 4700000000n,
//   orai17pd58ah5m63rfwrzagu8d5xrj33ktpd07ly3c2: 11400000000n,
//   orai17xvqzz0360h5h6qq6g758jclx2cmr03kepfm4l: 6900000000n,
//   orai199vxjrzl2azauhdkjpzu6qvvkcj84uans76e7m: 169300000000n,
//   orai1a5cec5y3l42ztxrfnu7qmerscj8ulggyrr96a8: 7456300000000n,
//   orai1ahldhgazdvhxf4cpyt4jgv2p56l8g2msse0txv: 11400000000n,
//   orai1ap6uf4radp9pm3yywx29ajd855rk9qt8ya22q6s8kn6jsg3g052qm4ypzx:
//     97558700000000n,
//   orai1avf3ygt6ctxx4yf4a98eae635lsat5u7tp4pkz: 80000000000n,
//   orai1ax88yuwrmapcmrrfm3r7c8xugphjgpgsuptsux: 4466200000000n,
//   orai1c3saa7m372l7l3s8gj8ldu6la65mtm74eele93: 1625300000000n,
//   orai1chy2hjq4ed3an026fd3wpk3lctz5zsq0qp6lnvg0t5scydhatkyq9a9hrv: 100000000n,
//   orai1cmra86aa3448fqpfwyql0nw0zdkvnszyma35km6prud67grm7ufqnr8fz2:
//     996200000000n,
//   orai1ctez088ufrn56vjph3l7pnmsh8nrt7kzfnv3y9: 3722600000000n,
//   orai1ctkyfppp6rf39stparz2wwply3jy94g2q2kfhu: 2400000000n,
//   orai1cuk2gqe7zmtrdxky6dwl7z7nquvn5vs4kxq4z9: 3071300000000n,
//   orai1d8fntr5wqv6cvazd4whp62cn96qrjdlupl4uda: 397700000000n,
//   orai1dd2dey7gn8afj0ah46urvltsepy3auaxxwrjrz: 700000000n,
//   orai1den7cl96a5cj75gz2r6rzdq4v5r4dxhaqgvgg3: 5100000000n,
//   orai1e08vpl6j6ulyhjnsqs3qmp66pemghfm4zrd2kz: 84200000000n,
//   orai1egvrc624tlywzc4mxphz69s6wtgh9uwgua5c86: 100000000n,
//   orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd: 3100000000n,
//   orai1f0ez58tl3n4aus83tjfc3hryly5vvwlj8afuna: 162300000000n,
//   orai1fl5zjdwsk994t8946aqwy0fx9stk2d6lqy0wd2: 500000000n,
//   orai1fm7dzkldqar7exguuvvm8lmncryh04eku6026f: 700000000n,
//   orai1fp37yx54rgtpfysnsd5vxlgqgy47st297cj0hl: 2832200000000n,
//   orai1fv5kwdv4z0gvp75ht378x8cg2j7prlywa0g35qmctez9q8u4xryspn6lrd:
//     12678200000000n,
//   orai1g4h64yjt0fvzv5v2j8tyfnpe5kmnetejvfgs7g: 81600000000n,
//   orai1g8rjydflz27vfyaemz00jhlj6tau0vkd8r2fgg: 100000000n,
//   orai1gkhfn804ej5pchkavdqu6g69dlzt2jn5u5klga: 2800000000n,
//   orai1gs0803a075ajle9ze3sgv6pu6gsxu2hwzmr4pal7xaqm7un5kheqy628vc: 100000000n,
//   orai1h8rg7zknhxmffp3ut5ztsn8zcaytckfemdkp8n: 3100000000n,
//   orai1hdjdsnj05fu4pa7uaenvencp8tea07g9klter8: 92100000000n,
//   orai1j5lw2jpanxwleqqrfg9qp477dl9umls2gxgh23: 4700000000n,
//   orai1j7vgzvk3cjmjj3ha3j3s3w4tucqj8tycg2s76r: 17700000000n,
//   orai1k8g0vlfmctyqtwahrxhudksz7rgrm6nsuwh8eq: 96600000000n,
//   orai1k9glyv87f7qfcpyv4fck5v64a6sayrvx3z9cyl: 23900000000n,
//   orai1ka2lk8qwsy77st3cdpz9kx0jz3ngqyhceyujtv: 17200000000n,
//   orai1kd7mve4c7n03lg94sa84fh2kmfrmqf3tm2y7m6: 8200000000n,
//   orai1knzg7jdc49ghnc2pkqg6vks8ccsk6efzfgv6gv: 13736800000000n,
//   orai1krzyd6jhmvf99x09m8gs5rlj2sfeh4n62wzng9: 1300000000n,
//   orai1l2226v9yud98hgw7zsppf2zr63ruy7cg7g85at: 2479600000000n,
//   orai1l6zz9p49e687wdsu20a5shf8nmp3ny0zhv7qzg: 292800000000n,
//   orai1lg53gcjway7v8rwg6ceg2h5puvhuzyvk2ye7wu: 23300000000n,
//   orai1lklwax8duymnu3lmylzc28rascwcuvrqnknle9: 4900000000n,
//   orai1mu26eqsel6ft7zf4ce596nwcmp5umegj9fyzd2: 3700000000n,
//   orai1mycmhyrmd6dusp408rtjgzlk7738vhtgqyhxxt: 1100000000n,
//   orai1nfgw2r0zmskmqyq2f8xqhx3rnkc0xr3sy8uau5: 6000000000n,
//   orai1nt58gcu4e63v7k55phnr3gaym9tvk3q4apqzqccjuwppgjuyjy6sxk8yzp:
//     4255300000000n,
//   orai1nur6ra4vs8awc7u9w2sm346mzxan74wjyjat37: 2393400000000n,
//   orai1qzr7rdnrsleyt7zu3c28trncqct8n8au0zvf2g: 2100000000n,
//   orai1r4vpmksn3yccqs3y5jg85fc02gtuxusetgjpqj: 30403500000000n,
//   orai1rchnkdpsxzhquu63y6r4j4t57pnc9w8ehdhedx: 2700000000n,
//   orai1sdpc2dwchmz4nhlq3xwhnz90yfg0v6484p7379: 2100000000n,
//   orai1u3jmh84mfycru6ewt3t3gexny6g5a6y928k6m9: 235600000000n,
//   orai1u3v64kv7xqutr7ut9w9z8jn226lq72q6k5jqlkqs9wul3ulfc2fste5g2h: 400000000n,
//   orai1ud59dkxkz5yqs80eedv4lvqm7pgsfny5m6tngy: 100000000n,
//   orai1v0rpxe7rnflp0yaj7k9c50qslzpp3gs2rps4qs: 1700000000n,
//   orai1vwu7py3cgwac05e2w06yzyg0zt0jlx555gyjnn: 9700000000n,
//   orai1w0rpd06tvf09vd7l28y52e4gmhjcwadjm74he6: 100000000n,
//   orai1w53pwenq62wu63p3cpl2jxaa7txs20y7dgshqg: 493900000000n,
//   orai1w68ltzusen3d9yuwuecak5wau2r9c7mv472pwn: 1414500000000n,
//   orai1wmfdfzcmugan9hecx4t5y6shsdrw593d3z5jfx: 100000000n,
//   orai1wwavn2m0sznlvqrxw4l7g3wcgj8u4j2jzy3prq: 330800000000n,
//   orai1xkz6wgg7tfhafc6ler46uuw8m3fv04ttj2x95f: 1000000000n,
//   orai1xlpjlh58ru8kqzfwdld0smlqheq6epy80nhpkd: 100000000n,
//   orai1xlpm8pl5axy7wypela503fg4xr8hc39nysc39h: 17900000000n,
//   orai1xw2nwa4gzufcmw34e3lkw7rt7anud6jpvwmr08: 317300000000n,
//   orai1y5u4z6nauzuwjdkusy36tg9m99w38mrr69aujp: 400000000n,
//   orai1yhcmp6g7wwvefv45g0afw200sadpg4scfyak63: 100000000n,
//   orai1yvhfsfzmnqv43exsmu0klahdwtt7p70hscdyh4: 55200000000n,
//   orai1yyr4d636rdrv5t46xmjpmm4fk8t0dekl35k4nc: 100000000n,
//   orai1yzsc2r5uuwf9s6sase3389zju9rpuwd7mmhv9x: 1900000000n,
//   orai1z8utdvq2n3869h6eej0cvjgl5xv47gfnazjx4u: 300300000000n,
//   orai1z9n730vhs52p0368xwe04w27ytx2ra095973yw: 1896200000000n,
//   orai1zv2v56usnjs05jr6fhmdd24adetpr3sgpv9xzh: 254000000000n,
// };

const CONVERT_USERS: { [key: string]: bigint } = {
  orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd: 10n,
  orai1yzmjgpr08u7d9n9qqhvux9ckfgq32z77c04lkg: 15n,
};

const main = async () => {
  // get the mnemonic
  const mnemonic = getMnemonic();

  // get signing client
  const { client, address } = await connect(mnemonic, OraichainConfig);
  const BTC_DENOM =
    "factory/orai1wuvhex9xqs3r539mvc6mtm7n20fcj3qr2m0y9khx6n5vtlngfzes3k0rq9/obtc";

  let sendMsgs = Object.keys(CONVERT_USERS).map((addr) => {
    return {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: address,
        toAddress: addr,
        amount: [coin(CONVERT_USERS[addr].toString(), BTC_DENOM)],
      },
    };
  });

  const tx = await client.signAndBroadcast(address, sendMsgs, "auto");
  console.log(tx.transactionHash);
};

main();
