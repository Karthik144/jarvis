import axios from "axios";
import * as fs from "fs"; // Import filesystem module

interface Coin {
    id: string;
    symbol: string;
    name: string;
    platforms: object;
}

async function getAllCoins() {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/list?include_platform=true`);
        const coins: Coin[] = response.data;

        // Transform the array into a hashmap
        const coinsMap = coins.reduce((acc: Record<string, string>, coin: Coin) => {
            acc[coin.symbol] = coin.id;
            return acc;
        }, {});

        // Print the hashmap
        console.log(coinsMap);

        // Convert the hashmap to a JSON string
        const jsonContent = JSON.stringify(coinsMap, null, 2);

        // Write the JSON string to a file
        fs.writeFile('coinsMap.json', jsonContent, 'utf8', (error) => {
            if (error) {
                console.error("An error occurred while writing JSON Object to File.", error);
                return;
            }

            console.log("JSON file has been saved.");
        });

    } catch (error) {
        console.error("Error getting coins:", error);
    }
}


getAllCoins();
