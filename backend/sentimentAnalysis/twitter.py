import json
import sys
import jmespath
from playwright.sync_api import sync_playwright
from typing import Dict
from googlesearch import search
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import time


def scrape_tweet(url: str) -> dict:
    _xhr_calls = []

    def intercept_response(response):
        """capture all background requests and save them"""
        # we can extract details from background requests
        if response.request.resource_type == "xhr":
            _xhr_calls.append(response)
        return response

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # enable background request intercepting:
        page.on("response", intercept_response)
        # go to url and wait for the page to load
        page.goto(url)
        page.wait_for_selector("[data-testid='tweet']")

        # find all tweet background requests:
        tweet_calls = [f for f in _xhr_calls if "TweetResultByRestId" in f.url]
        for xhr in tweet_calls:
            data = xhr.json()
            return data['data']['tweetResult']['result']



def parse_tweet(data: Dict) -> Dict:
    """Parse Twitter tweet JSON dataset for the most important fields"""
    result = jmespath.search(
        """{
        created_at: legacy.created_at,
        tagged_users: legacy.entities.user_mentions[].screen_name,
        text: legacy.full_text,
        language: legacy.lang,
        user_id: legacy.user_id_str,
        id: legacy.id_str
    }""",
        data,
    )
    result["poll"] = {}
    poll_data = jmespath.search("card.legacy.binding_values", data) or []
    for poll_entry in poll_data:
        key, value = poll_entry["key"], poll_entry["value"]
        if "choice" in key:
            result["poll"][key] = value["string_value"]
        elif "end_datetime" in key:
            result["poll"]["end"] = value["string_value"]
        elif "last_updated_datetime" in key:
            result["poll"]["updated"] = value["string_value"]
        elif "counts_are_final" in key:
            result["poll"]["ended"] = value["boolean_value"]
        elif "duration_minutes" in key:
            result["poll"]["duration"] = value["string_value"]
    return result


#main
if __name__ == "__main__":
    tokenName = sys.argv[1]
    sentimentDict = {
        "data": {},
        "compound_score": 0,
        "tweet_num": 0,
        "sentiment": ''
    }

    sentiment = SentimentIntensityAnalyzer()
    # query = f"{tokenName} cryptocurrency opinions on twitter" 
    query = f'site:twitter.com inurl:status "{tokenName}" cryptocurrency opinions'
    keywords = ["twitter", "status"]
    for j in search(query, num_results=15):
        if all(keyword in j for keyword in keywords):
            dict = scrape_tweet(j)
            tweet = parse_tweet(dict)

            sentiment_score = sentiment.polarity_scores(tweet['text'])
            # print(f"Sentiment of tweet: {sentiment_score}")
            sentimentDict['compound_score'] += sentiment_score['compound']
            sentimentDict['data'][j] = sentiment_score
            sentimentDict['tweet_num'] += 1

    #calculate cum sentiment score
    sentimentDict['compound_score'] = sentimentDict['compound_score'] / sentimentDict['tweet_num']

    #save cache
    sentimentDict['timestamp'] = time.time()

    if(sentimentDict['compound_score'] > 0):
        sentimentDict["sentiment"] = 'positive'
    elif(sentimentDict['compound_score'] < 0):
        sentimentDict["sentiment"] = 'negative'
    else:
        sentimentDict["sentiment"] = 'neutral'

    sentimentDictJSON = json.dumps(sentimentDict)
    print(sentimentDictJSON)

    
            
