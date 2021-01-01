require('dotenv').config()

const express = require('express')
const path = require('path');
const API = require('call-of-duty-api')();
const _ = require('lodash');

let cache;

if (process.env.MEMCACHE_ENABLED) {
    const memjs = require('memjs');
    cache = memjs.Client.create(`${process.env.MEMCACHE_HOST}:${process.env.MEMCACHE_PORT}`, {
        username: process.env.MEMCACHE_USERNAME,
        password: process.env.MEMCACHE_PASSWORD
    });
}

const fetchPlayerData = async () => {
    let players = {};
    try {
        await API.login(process.env.COD_EMAIL, process.env.COD_PASSWORD);
        players["greenelf#1972"] = await API.MWcombatwz("greenelf#1972", "battle");
        players["ChampaignPapi_96"] = await API.MWcombatwz("ChampaignPapi_96", "psn");
        players["kangaroo_rob"] = await API.MWcombatwz("kangaroo_rob", "psn");
    } catch(Error) {}
    return players;
}

const app = express()
const port = process.env.PORT || 80;
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('/api', async (req, res) => {
    let players = null;

    if (process.env.MEMCACHE_ENABLED) {
        ({ value: players } = await cache.get("players"));
    }

    // cache miss or memcache disabled
    if (players === null) {
        try {
            players = await fetchPlayerData();
            if (process.env.MEMCACHE_ENABLED) {
                await cache.set("players", JSON.stringify(players), { expires: 600 })
            }
        } catch (Error) {}
    } else {
        // cache hit, parse Buffer as JSON (only occurs if caching is enabled)
        players = JSON.parse(players);
    }


    let matches = {};
    Object.entries(players).forEach(player => {
        const [playerName, playerData] = player;
        playerData.matches.forEach((match => {
            const matchList = _.get(matches, match['matchID'], []);
            matchList.push(playerName);
            matches[match['matchID']] = matchList;
        }));
    });

    filteredMatches = _.pickBy(matches, function (value) { return value.length > 1; })

    res.json({
        'players': players,
        'matches': filteredMatches
    })
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})