require('dotenv').config()

const express = require('express')
const path = require('path');
const API = require('call-of-duty-api')();
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

sequelize = new Sequelize(process.env.POSTGRES_DB_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        rejectUnauthorized: false
    }
});

const UpdateTrack = sequelize.define('UpdateTrack', {}, {
    // disable the modification of tablenames; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    freezeTableName: true,
});
UpdateTrack.sync();

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
    damageDone: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    damageTaken: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teamPlacement: {
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
    { "username": "Dbajj#1645", "platform": "battle", "display": "Dbajj"},
]
const SECONDS_UPDATE_DELAY = 60;

const app = express()
const port = process.env.PORT || 80;
app.use(cors())

let refreshData = async () => {
    const updateTracker = await UpdateTrack.findOne({
        order: [['createdAt', 'DESC']],
    });
    if (updateTracker === null || Math.floor((Date.now() - updateTracker.updatedAt) / 1000) > SECONDS_UPDATE_DELAY) {
        if (updateTracker === null) {
            // If no update row exists, create it
            UpdateTrack.create({});
        } else {
            // Else, update the updatedAt field
            updateTracker.changed("updatedAt", true);
            await updateTracker.save();
        }
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
        await API.login(process.env.COD_EMAIL, process.env.COD_PASSWORD);
        for (let i = 0; i < PLAYERS.length; i++) {
            console.log("processing " + PLAYERS[i]['username']);
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
                                    await Match.create({
                                        matchId: match.matchId,
                                        playerName: PLAYERS[j]['username'],
                                        mode: filteredMatchData[0].mode,
                                        gameType: filteredMatchData[0].gameType,
                                        kills: filteredMatchData[0].playerStats.kills || 0,
                                        deaths: filteredMatchData[0].playerStats.deaths || 0,
                                        assists: filteredMatchData[0].playerStats.assists || 0,
                                        gulagKills: filteredMatchData[0].playerStats.gulagKills || 0,
                                        timePlayed: filteredMatchData[0].playerStats.timePlayed || 0,
                                        damageDone: filteredMatchData[0].playerStats.damageDone || 0,
                                        damageTaken: filteredMatchData[0].playerStats.damageTaken || 0,
                                        teamPlacement: filteredMatchData[0].playerStats.teamPlacement || 0,
                                        matchStart: filteredMatchData[0].utcStartSeconds,
                                        matchEnd: filteredMatchData[0].utcEndSeconds,
                                    });
                                }
                            }
                        }
                    } else {
                        break;
                    }
                };
            } catch (e) {
                console.log(e)
            }
        };
        return "SUCCESS";
    } else {
        return "UPDATE_REFUSED";
    }
}
app.get('/refresh', cors(), async (req, res) => {
    const resp = await refreshData();
    res.json({ "message": resp });
});


app.get('/api', cors(), async (req, res) => {
    const [results,] = await sequelize.query("SELECT * FROM \"Matches\" WHERE \"matchId\" IN (SELECT * FROM (SELECT \"matchId\" FROM \"Matches\" GROUP BY \"matchId\" HAVING COUNT(\"matchId\") > 1) AS a) ORDER BY \"matchStart\" DESC;");
    const updatedTrack = await UpdateTrack.findOne({
        order: [['createdAt', 'DESC']],
    });
    if (updatedTrack === null) {
        UpdateTrack.create({});
    }
    res.json({
        'results': results,
        'triggerRefresh': Math.floor((Date.now() - updatedTrack.updatedAt) / 1000) > SECONDS_UPDATE_DELAY,
        'updatedAgo': updatedTrack.updatedAt,
        'players': PLAYERS,
    });
})

app.get('/api/match/:id', async (req, res) => {
    const matchData = await Match.findAll({
        where: {
            matchId: req.params.id
        }
    });
    res.json(matchData)
});

app.get('/api/player/:name', async (req, res) => {
    const [kills_by_week,] = await sequelize.query(`
        SELECT (CAST(date_trunc('week', CAST((CAST(to_timestamp("public"."Matches"."matchStart") AS timestamp) + (INTERVAL '1 day')) AS timestamp)) AS timestamp) + (INTERVAL '-1 day')) AS "time", avg("public"."Matches"."kills") AS "value"
        FROM "public"."Matches"
        WHERE "public"."Matches"."playerName" = '${req.params.name}'
        GROUP BY (CAST(date_trunc('week', CAST((CAST(to_timestamp("public"."Matches"."matchStart") AS timestamp) + (INTERVAL '1 day')) AS timestamp)) AS timestamp) + (INTERVAL '-1 day'))
        ORDER BY (CAST(date_trunc('week', CAST((CAST(to_timestamp("public"."Matches"."matchStart") AS timestamp) + (INTERVAL '1 day')) AS timestamp)) AS timestamp) + (INTERVAL '-1 day')) ASC
    `);
    res.json({
        'kills_by_week': kills_by_week
    })
});

app.get('/', (req, res) => {
    res.send('cod-dash api is ok')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})