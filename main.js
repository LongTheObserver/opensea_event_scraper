const fetch = require('node-fetch');
require('dotenv').config();

let listingCache = [];
const slug = process.env.COLLECTION_SLUG;
const apiKey = process.env.OS_API_KEY;

async function start () {
    const headers = {
        "Accept": "application/json",
        "X-API-KEY": apiKey
        };
    while (1) {
        try {
            let lastTimestamp = null;
            if ( lastTimestamp == null ) {
                lastTimestamp = Math.floor(Date.now()/1000) - 1;
            } //else {
                //lastTimestamp -= 1;
            //}
            let newTimestamp = Math.floor(Date.now()/1000);
            let url = "https://api.opensea.io/api/v1/events?only_opensea=false&collection_slug=" + slug + "&occurred_before=" + newTimestamp + "&occurred_after=" + lastTimestamp + "&offset=0"
            await new Promise(r => setTimeout(r, 1000));
            let res = await fetch(url, { method: "GET", headers: headers});
            if (res.status != 200) {
              throw new Error(`Couldn't retrieve events: ${res.statusText}`);
            }
            
            let data = await res.json();
            console.log(`${data.asset_events.length} new listings - ${url}`)
            if (data.asset_events.length == 0) {
                continue;
            }
            data.asset_events.forEach(function(event) {
                if (event.asset) {
                    if (listingCache.includes(event.id)) {
                        return;
                      } else {
                        listingCache.push(event.id);
                        if (listingCache.length > 200) listingCache.shift();
                      }
                }
                
            });
        }
        catch (error) {
            console.error(error);
            return;
        }
    }
}

start()
