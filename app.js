require('dotenv').config()

const express = require('express')
const path = require('path');
const API = require('call-of-duty-api')();
const _ = require('lodash');
const { Sequelize, DataTypes } = require('sequelize');

sequelize = new Sequelize(process.env.POSTGRES_DB_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        rejectUnauthorized: false
    }
});

const Match = sequelize.define('Match', {
    matchId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    playerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gameType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kills: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    deaths: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assists: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gulagKills: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timePlayed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    matchStart: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    matchEnd: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});
Match.sync();

const PLAYERS = [
    { "username": "greenelf#1972", "platform": "battle", "display": "greenelf" },
    { "username": "ChampaignPapi_96", "platform": "psn", "display": "bballlova99" },
    { "username": "kangaroo_rob", "platform": "psn", "display": "kangaroo" },
    { "username": "ItsGravityMurph#4770231", "platform": "acti", "display": "ItsGravityMurph" },
]

const app = express()
const port = process.env.PORT || 80;
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/refresh', async (req, res) => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    await API.login(process.env.COD_EMAIL, process.env.COD_PASSWORD);
    for (let i = 0; i < PLAYERS.length; i++) {
        try {
            const allMatches = await API.MWfullcombatwz(PLAYERS[i]['username'], PLAYERS[i]['platform']);
            for (const match of allMatches) {
                const exists = await Match.count({
                    where: {
                        matchId: match.matchId,
                        playerName: PLAYERS[i]['username']
                    }
                });
                if (!exists) {
                    console.log("getting match " + match.matchId);
                    const matchData = await API.MWFullMatchInfowz(match.matchId, PLAYERS[i]['platform']);
                    for (let j = 0; j < PLAYERS.length; j++) {
                        const filteredMatchData = matchData.allPlayers.filter(d => d.player.username === PLAYERS[j]['display']);
                        if (filteredMatchData.length) {
                            const existsForPlayer = await Match.count({
                                where: {
                                    matchId: match.matchId,
                                    playerName: PLAYERS[j]['username']
                                }
                            });
                            if (!existsForPlayer) {
                                // console.log("inserting for " + PLAYERS[j]['username']);
                                const record = await Match.create({
                                    matchId: match.matchId,
                                    playerName: PLAYERS[j]['username'],
                                    mode: filteredMatchData[0].mode,
                                    gameType: filteredMatchData[0].gameType,
                                    kills: filteredMatchData[0].playerStats.kills || 0,
                                    deaths: filteredMatchData[0].playerStats.deaths || 0,
                                    assists: filteredMatchData[0].playerStats.assists || 0,
                                    gulagKills: filteredMatchData[0].playerStats.gulagKills || 0,
                                    timePlayed: filteredMatchData[0].playerStats.timePlayed || 0,
                                    matchStart: filteredMatchData[0].utcStartSeconds,
                                    matchEnd: filteredMatchData[0].utcEndSeconds,
                                });
                                // console.log(record);
                            }
                        }
                    }
                } else {
                    // console.log("found in db")
                }
            };
        } catch (e) {
            console.log(e)
        }
    };
    res.send("done")
});


app.get('/api', async (req, res) => {
    const [results,] = await sequelize.query("SELECT * FROM \"Matches\" WHERE \"matchId\" IN (SELECT * FROM (SELECT \"matchId\" FROM \"Matches\" GROUP BY \"matchId\" HAVING COUNT(\"matchId\") > 1) AS a);");
    res.json(results);
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})