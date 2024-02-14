// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

//Momentum factors:
    // 1. ROC 2nd price-derivative: if ROC of %24Hr_change over last 7 days is positive +1 else -1
    // 2. ROC 2nd price-derivative: if ROC of %30D_volume over last 7 days is > 2% +1
    // 3. ROC 1st volume-derivative: if volume grew from beginning of week to end +1 else -1
  

    // 4. 2. Volume: % of V / MC(> 10 % +1, 5 - 10 % 0, <5% -1) (SIDELINED)
    //  X. Sentiment(EVENTUALLY)

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

      let daily_pct_change_list: Number[] = []
      let monthly_pct_change_list: Number[] = []
      let volume_list: Number[] = []
      
      for (let entry of data['seven_day_data']) {
        // Calculate momentum score based on provided data
        const day_pct_change = Number(entry['price_change_percentage_24h']);
        const month_pct_change = Number(entry['price_change_percentage_30d_in_currency']);
        const volume = Number(entry['total_volume'])
        
        daily_pct_change_list.push(day_pct_change);
        monthly_pct_change_list.push(month_pct_change);
        volume_list.push(volume);
      }

      let roc_daily_pct = await calc_derivative(daily_pct_change_list)
      let roc_monthly_pct = await calc_derivative(monthly_pct_change_list)
      let roc_volume = await calc_derivative(volume_list)

      //1.
      if (roc_daily_pct > 0) {
        new_score += 1;
      }
      else {
        new_score -= 1;
      }

      //2.
      if (roc_monthly_pct > 2) {
        new_score += 1;
      }

      //3.
      if (roc_volume > 0) {
        new_score += 1;
      }
      else {
        new_score -= 1;
      }

      return new_score;
    } catch (error) {
        throw new Error(`Error calculating momentum score: ${error}`);
    }
}

function calc_derivative(values: Number[]) {
  const rocValues: number[] = [];

    for (let i = 1; i < values.length; i++) {
        const dailyChange = Number(values[i]) - Number(values[i - 1]);
        const roc = (dailyChange / Number(values[i - 1]) * 100); 
        rocValues.push(roc);
    }
  
    const sum = rocValues.reduce((acc, val) => acc + val, 0);
    const averageSecondDerivative = sum / rocValues.length;

    return averageSecondDerivative;
}