// src/services/fetchTransactions.js
import axios from 'axios';

export const fetchTransactions = async () => {
  try {
    // GraphQL query for fetching transaction data
    const query = `
      query {
        EVM(network: bsc) {
          DEXTrades(
            where: {Trade: {Buy: {AmountInUSD: {gt: "100000"}}}}
          ) {
            Block {
              Time
              Number
            }
            Transaction {
              Hash
            }
            Trade {
              Buy {
                Amount
                AmountInUSD
                Buyer
                Currency {
                  Name
                  Symbol
                }
                Price
                PriceInUSD
                Seller
              }
              Dex {
                ProtocolFamily
                ProtocolName
                ProtocolVersion
                SmartContract
              }
              Sell {
                Amount
                AmountInUSD
                Buyer
                PriceInUSD
                Price
                Seller
                Currency {
                  Name
                  Symbol
                }
              }
            }
          }
        }
      }
    `;

    // Axios request configuration
    const config = {
      method: 'post',
      url: 'https://streaming.bitquery.io/graphql',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': 'BQY0J9aNBEbupESl6AzOVBIyTv2mEqws'
      },
      data: {
        query: query,
        variables: {}
      }
    };

    const response = await axios.request(config);

    // Handle empty response
    if (!response.data) {
      console.error("Error: Received empty response from Bitquery.");
      throw new Error('Empty response from Bitquery');
    }

    // Handle GraphQL errors in the response
    if (response.data.errors) {
      console.error('GraphQL Errors:', JSON.stringify(response.data.errors, null, 2));
      throw new Error(response.data.errors[0].message);
    }

    // Check for the expected data structure
    const transactions = response.data.data?.EVM?.DEXTrades || [];
    if (!Array.isArray(transactions)) {
      console.error("Error: Unexpected data format in response:", transactions);
      throw new Error("Unexpected data format received from Bitquery.");
    }

    // Map and format transactions, with added safety checks
    return transactions.map((tx, index) => {
      const hash = tx?.Transaction?.Hash;
      const amount = tx?.Trade?.Buy?.Amount;
      const amountInUSD = tx?.Trade?.Buy?.AmountInUSD;
      const currencySymbol = tx?.Trade?.Buy?.Currency?.Symbol;
      const sender = tx?.Trade?.Buy?.Seller;
      const to = tx?.Trade?.Buy?.Buyer;
      const blockTime = tx?.Block?.Time;
      const blockNumber = tx?.Block?.Number;

      // Ensure required fields are available
      if (!hash || !amount || !currencySymbol || !blockTime || !amountInUSD) {
        console.warn("Warning: Incomplete transaction data encountered", tx);
        return null; // Skip incomplete transaction entries
      }

      return {
        key: `${hash}-${index}`,  // Use a unique key combining hash and index
        hash: hash,
        amount: `${Number(amount).toFixed(6)} ${currencySymbol} ($${Number(amountInUSD).toLocaleString()})`,
        sender: sender || "Unknown",
        to: to || "Unknown",
        blockHeight: blockNumber || index, // Use block number or index as fallback
        timestamp: blockTime
      };
    }).filter(Boolean); // Filter out any null values from incomplete transactions

  } catch (error) {
    console.error("Error fetching blockchain data:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
