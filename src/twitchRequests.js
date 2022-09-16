const { default: axios } = require("axios")


let twitchToken = ""
let isStreamingOn = false
const clientId = process.env.TWITCH_CLIENT_ID
let timesToGetToken = 0

async function getTwitchToken() {
    const idUrlBase = process.env.TWITCH_ID_URL_BASE

    const clientSecret = process.env.TWITCH_CLIENTE_SECRET

    console.log("Getting a twitch token!")

    await axios.post(`${idUrlBase}/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`).then(response => {

        if (response.status === 200) {

            twitchToken = response.data.access_token
            console.info("Twitch token successfully got!")
            timesToGetToken = 0

        }
    }).catch(err => {
        console.error(`Was not possible to get a twitch token!\n ${err}`)
    })
}

async function checkStreamerIsLive() {

    if (twitchToken === null || twitchToken === "") {
        await getTwitchToken()
    }

    const userId = process.env.TWITCH_USER_ID
    const apiUrlBase = process.env.TWITCH_API_URL_BASE

    const config = {
        headers: {
            "Authorization": `Bearer ${twitchToken}`,
            "client-id": clientId
        }
    }

    console.info("Checking if streamer is online!")

    await axios.get(`${apiUrlBase}/streams?user_id=${userId}`, config).then(response => {

        if (response.status === 200) {
            isStreamingOn = response.data.data.length !== 0
        }

    }).catch(async err => {

        if (err.status === 401 && timesToGetToken < 3) {

            await getTwitchToken()
            timesToGetToken++

        } else {

            isStreamingOn = false
        }
    })

    console.info(`Streamer is ${isStreaming() ? "online" : "offline"}!`)

}

let isStreaming = () => {
    return isStreamingOn
}

module.exports = { checkStreamerIsLive, isStreaming }

