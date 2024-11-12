import { GraphQLClient, gql } from "graphql-request";
import { calculateAmountDelta } from "@oraichain/oraiswap-v3";

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  coingeckoId: string;
}

interface PoolInfo {
  tokenX: TokenInfo;
  tokenY: TokenInfo;
  currentTick: number;
  sqrtPrice: string;
}

interface NodeInfo {
  ownerId: string;
  pool: PoolInfo;
  liquidity: string;
  tickLower: string;
  tickUpper: string;
}

const v3Pools = [
  "orai-orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd-3000000000-100",
  "orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd-orai12hzjxfh77wl572gdzct2fxv2arxcwh6gykc7qh-3000000000-100",
  "ibc/FA2E2EEC9057A4A1C2C0A6A4C78B0239118DF5F278830F50B4A6BDD7A66506B78-orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd-10000000000-100",
];
const main = async () => {
  const endpoint = "https://staging-ammv3-indexer.oraidex.io/";
  const client = new GraphQLClient(endpoint);
  const snapshotHeight = 38869462;

  for (const v3Pool of v3Pools) {
    const gpl = `
    query {
      positions (filter:{
        poolId: {
             equalTo: "${v3Pool}" 
        }
        status: {
          equalTo: true
        }
    
      }
        blockHeight: "${snapshotHeight}"
      ) {
        nodes {
          ownerId
          pool {
            currentTick
            sqrtPrice
            tokenX {
              name
              symbol
              decimals
              coingeckoId
            }
            tokenY {
              name
              symbol
              decimals
              coingeckoId
            }
          }
          liquidity
          tickLower
          tickUpper
        }
      }
    }
    `;

    const requestData = (await client.request(gpl)) as any;
    const nodes = requestData.positions.nodes as NodeInfo[];
    console.log(`V3 pool id: ${v3Pool}`);
    console.log("====================================");
    for (const node of nodes) {
      const amounts = calculateAmountDelta(
        node.pool.currentTick,
        BigInt(node.pool.sqrtPrice),
        BigInt(node.liquidity),
        false,
        Number(node.tickUpper),
        Number(node.tickLower)
      );
      console.log("Owner id: ", node.ownerId);
      console.log(
        `X symbol: ${node.pool.tokenX.symbol} - Amount: ${amounts.x}`
      );
      console.log(
        `Y symbol: ${node.pool.tokenY.symbol} - Amount: ${amounts.y}`
      );
      console.log("====================================");
    }
  }
};

main();
