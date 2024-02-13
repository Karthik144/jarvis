// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  const { time } = await req.json()
  const data = {
    message: `Ran at: ${time}!`,
  }

  await main();

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

async function main() {
    try {
        // Read in growth-list table
        let { data: growth_list, error } = await supabase
            .from('growth-list')
            .select("symbol,data");

        if (error) {
            throw new Error(`Error reading 'growth-list': ${error.message}`);
        }

        if (!growth_list) {
            console.error("No data found in 'growth-list'");
            return;
        }

        for (let row of growth_list) {
            let symbol = row.symbol;
            let data = row.data;

            await update_momentum_score(symbol, data);

        }

        console.log("Momentum Scores Updated!");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function update_momentum_score(symbol: string, data: any) {
    try {
        let { data: momentum_list_row, error } = await supabase
            .from('momentum-list')
            .select('momentum_scores_30D,momentum_score_current')
            .filter('symbol', 'eq', symbol)
            .single();

        let current_score = 0;
        let momentum_scores_30D: Number[] = [];

        if (momentum_list_row) {
            current_score = momentum_list_row.momentum_score_current || 0;
            momentum_scores_30D = momentum_list_row.momentum_scores_30D || [];
        }

        const new_score = await calculate_momentum_score(data, current_score);

        // Maintain 30-values
        momentum_scores_30D.push(new_score);
        if (momentum_scores_30D.length > 30) {
            momentum_scores_30D.shift();
        }

        // Update momentum-list table
        await supabase
            .from('momentum-list')
            .upsert({
                symbol: symbol,
                momentum_scores_30D: momentum_scores_30D,
                momentum_score_current: new_score
            }, { onConflict: 'symbol' });

    } catch (error) {
        console.error("An error occurred in update_momentum_score:", error);
    }
}

async function calculate_momentum_score(data: any, current_score: number) {
    try {
        let new_score = current_score;

        // Calculate momentum score based on provided data
        const day_pct_change = Number(data['price_change_percentage_24h']);
        const month_pct_change = Number(data['price_change_percentage_30d_in_currency']);

        if (day_pct_change > 0 && month_pct_change > 0) {
            new_score += 1;
        } else if (day_pct_change < 0 && month_pct_change < 0) {
            new_score -= 1;
        }

        const total_volume = Number(data['total_volume']);
        const market_cap = Number(data['market_cap']);

        const volume_ratio = (total_volume / market_cap) * 100;
        if (volume_ratio >= 10) {
            new_score += 1;
        } else if (volume_ratio >= 5) {
            new_score += 0;
        } else {
            new_score -= 1;
        }

        return new_score;
    } catch (error) {
        throw new Error(`Error calculating momentum score: ${error}`);
    }
}


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/momentum-rank' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
