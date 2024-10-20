import XLSX from "xlsx";
import path from "path";
import axios from "axios";
import { differenceInYears, differenceInMonths } from "date-fns";
import { setTimeout } from "timers/promises";
import { flattenTokens } from "@oraichain/oraidex-common";
// import { flattenTokens } from "@oraichain/oraidex-common";

export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export async function retry<T>(
  fn: (...params: any[]) => Promise<T>,
  delay: number = 1000,
  ...params: any[]
): Promise<T> {
  try {
    return await fn(...params);
  } catch (e) {
    await setTimeout(delay);
    return await fn(...params);
  }
}

const API_COINGECKO = {
  PRICE: (ids: any, currency: any) =>
    `https://price.market.orai.io/simple/price?ids=${ids}&vs_currencies=${currency}`,
};

export const getGeckoMarketBalance = async (ids = "", currency = "usd") => {
  // remove undefined
  let coingeckoIds = ids.replace(new RegExp(",undefined", "gm"), "");
  coingeckoIds = [...new Set(coingeckoIds.split(","))].join(",");
  return ids
    ? await axios(`${API_COINGECKO.PRICE(coingeckoIds, currency)}`)
    : { data: {} };
};

const fetchData = async () => {
  const arrayCoin = flattenTokens.map((e) => e.coinGeckoId).join(",");

  let price = await getGeckoMarketBalance(arrayCoin);

  return price;
};

// https://api.scan.orai.io/v1/txs-contract/orai18vd8fpwxzck93qlwghaj6arh4p7c5n8903w6c8?limit=10&page_id=1
// https://api.scan.orai.io/v1/txs-account/orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd?limit=10&page_id=1
// https://api.scan.orai.io/v1/account/coins/orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd
const main = async () => {
  const pathname = path.join(__dirname, "data/contracts.xlsx");
  const workbook = XLSX.readFile(pathname);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const addressBookArr = chunkArray(
    sheetData.splice(1).map((row: any) => row[0]),
    5
  );
  const now = new Date();

  // let fullDateTimeStr: string[] = [];
  // let fullDateTime: string[] = [];

  // console.log(
  //   flattenTokens.find((item) => item.name.toLowerCase() == "scorai")
  // );

  let count = 0;
  // for (const addressBook of addressBookArr) {
  //   const result = await Promise.all(
  //     addressBook.map(async (address) => {
  //       const txResponse = await retry(() =>
  //         axios.get(
  //           `https://api.scan.orai.io/v1/txs-contract/${address}?limit=10&page_id=1`
  //         )
  //       );
  //       const txResData = txResponse.data;
  //       let txFloat = "INFINITY";
  //       let txDifYears = 0;
  //       let txDifMonths = 0;
  //       if (txResData?.data && txResData.data.length > 0) {
  //         txDifYears = differenceInYears(
  //           now,
  //           new Date(txResData.data[0].timestamp)
  //         );
  //         txDifMonths =
  //           differenceInMonths(now, new Date(txResData.data[0].timestamp)) % 12;
  //         txFloat = (txDifYears + txDifMonths / 12).toFixed(2);
  //       }

  //       let accountFloat = "INFINITY";
  //       let accountDifYears = 0;
  //       let accountDifMonths = 0;
  //       const accountResponse = await retry(() =>
  //         axios.get(`https://api.scan.orai.io/v1/account/coins/${address}`)
  //       );
  //       const accountData = accountResponse.data;
  //       if (accountData?.data && accountData.data.length > 0) {
  //         accountDifYears = differenceInYears(
  //           now,
  //           new Date(accountData.data[0].timestamp)
  //         );
  //         accountDifMonths =
  //           differenceInMonths(now, new Date(accountData.data[0].timestamp)) %
  //           12;
  //         accountFloat = (accountDifYears + accountDifMonths / 12).toFixed(2);
  //       }

  //       if (txFloat === "INFINITY" && accountFloat === "INFINITY") {
  //         return ["INFINITY", "not-used"];
  //       }
  //       if (txFloat === "INFINITY") {
  //         return [
  //           accountFloat,
  //           `${accountDifYears} years ${accountDifMonths} months`,
  //         ];
  //       }
  //       if (accountFloat === "INFINITY") {
  //         return [txFloat, `${txDifYears} years ${txDifMonths} months`];
  //       }

  //       if (parseFloat(txFloat) < parseFloat(accountFloat)) {
  //         return [txFloat, `${txDifYears} years ${txDifMonths} months`];
  //       }
  //       return [
  //         accountFloat,
  //         `${accountDifYears} years ${accountDifMonths} months`,
  //       ];
  //     })
  //   );
  //   fullDateTime = [...fullDateTime, ...result.map((item) => item[0])];
  //   fullDateTimeStr = [...fullDateTimeStr, ...result.map((item) => item[1])];
  //   console.log(count, result);
  //   count++;
  //   await setTimeout(200);
  // }
  // fullDateTime.forEach((data, index) => {
  //   const cellAddress = `E${index + 1 + 1}`;
  //   worksheet[cellAddress] = { v: data };
  // });
  // XLSX.writeFile(workbook, pathname);
  // fullDateTimeStr.forEach((data, index) => {
  //   const cellAddress = `G${index + 1 + 1}`;
  //   worksheet[cellAddress] = { v: data };
  // });
  // XLSX.writeFile(workbook, pathname);

  // console.log("Done");

  const price = await fetchData();
  count = 0;
  let fullBalance: any[] = [];
  for (const addressBook of addressBookArr) {
    const result = await Promise.all(
      addressBook.map(async (item) => {
        const nativeTokenResponse = await retry(() =>
          axios.get(
            `https://aws.scan.orai.io/v1/account/balance/${item}?token_type=native&limit=5&page_id=1`
          )
        );
        const nativeTokenData = nativeTokenResponse.data;
        const nativeTokens = nativeTokenData.balances || [];

        const cw20TokenResponse = await retry(() =>
          axios.get(
            `https://aws.scan.orai.io/v1/account/balance/${item}?token_type=cw20&limit=5&page_id=1`
          )
        );
        const cw20TokenData = cw20TokenResponse.data;
        const cw20Tokens = cw20TokenData.balances || [];

        let totalValue = 0;
        for (const token of [...nativeTokens, ...cw20Tokens]) {
          let convertedToken = flattenTokens.find(
            (item) =>
              item.denom === token.base_denom ||
              (item.name.toLowerCase() === token.base_denom &&
                token.org === "Oraichain")
          );
          if (!convertedToken) {
            continue;
          }

          console.log(
            token.amount,
            convertedToken,
            price.data[convertedToken.coinGeckoId].usd
          );
          totalValue +=
            (Number(token.amount) / 10 ** convertedToken.decimals) *
            price.data[convertedToken.coinGeckoId].usd;
        }
        return totalValue.toFixed(2);
      })
    );
    fullBalance = [...fullBalance, ...result];
    count++;
    await setTimeout(200);
  }

  fullBalance.forEach((data, index) => {
    const cellAddress = `H${index + 1 + 1}`;
    worksheet[cellAddress] = { v: data };
  });
  XLSX.writeFile(workbook, pathname);
};

main();
