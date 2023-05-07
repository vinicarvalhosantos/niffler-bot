require('dotenv/config');

const tmi = require("tmi.js");
const onMessage = require("./src/onMessage")

const { checkStreamerIsLive } = require("./src/twitchRequests")
const { fetchExternalEmotes } = require("./src/bttvFFZRequests")

const cron = require("node-cron");


const BOT_NAME = process.env.BOT_NAME;
const CHANNEL_NAME = process.env.CHANNEL_NAME;

const configuration = {
    identity: {
        username: BOT_NAME,
        password: process.env.TWITCH_TOKEN
    },
    channels: [CHANNEL_NAME]
};

checkStreamerIsLive()
fetchExternalEmotes()

cron.schedule("* */15 * * *", () => {
    fetchExternalEmotes()
})

cron.schedule("* */15 * * *", () => {
    checkStreamerIsLive()
})

cron.schedule("* */30 * * *", () => {
    checkStreamerIsLive()
})

const client = tmi.client(configuration);

client.on("message", onMessage);

client.connect();