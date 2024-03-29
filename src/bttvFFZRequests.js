const { default: axios } = require("axios");
const dateNow = require("./date")

let bttvFFZSevenEmotes = [];
const broadcasterId = process.env.TWITCH_USER_ID;
const apiUrlBase = process.env.BTTVFFZ_API_URL_BASE;
const sevenTvApiUrlBase = process.env.SEVENTV_API_URL_BASE;

async function fetchExternalEmotes() {

    console.info(`${dateNow} - Fetching BTTV, FFZ and 7TV emotes!`)

    await axios.get(`${apiUrlBase}/emotes/global`).then(resp => {
        if (resp.status === 200) {
            const data = resp.data
            if (data.length !== 0) {
                for (emote of data) {
                    bttvFFZSevenEmotes.push({
                        id: emote.id,
                        code: emote.code
                    })
                }
            }

        }
    }).catch(err => {
        console.error(`${dateNow} - An error occurred when tried to fetch the BTTV Global emotes!\n${err}`)
    })

    await axios.get(`${apiUrlBase}/users/twitch/${broadcasterId}`).then(resp => {
        if (resp.status === 200) {
            const channelEmotes = resp.data.channelEmotes
            const sharedEmotes = resp.data.sharedEmotes
            if (channelEmotes.length !== 0) {
                for (emote of channelEmotes) {
                    bttvFFZSevenEmotes.push({
                        id: emote.id,
                        code: emote.code
                    })
                }

                for (emote of sharedEmotes) {
                    bttvFFZSevenEmotes.push({
                        id: emote.id,
                        code: emote.code
                    })
                }
            }

        }
    }).catch(err => {
        console.error(`${dateNow} - An error occurred when tried to fetch the BTTV Channel emotes!\n${err}`)
    })

    await axios.get(`${apiUrlBase}/frankerfacez/users/twitch/${broadcasterId}`).then(resp => {
        if (resp.status === 200) {
            const channelEmotes = resp.data
            if (channelEmotes.length !== 0) {
                for (emote of channelEmotes) {
                    bttvFFZSevenEmotes.push({
                        id: emote.id,
                        code: emote.code
                    })
                }
            }

        }
    }).catch(err => {
        console.error(`${dateNow} - An error occurred when tried to fetch the FFZ Channel emotes!\n${err}`)
    })

    await axios.get(`${sevenTvApiUrlBase}/emotes/global`).then(resp => {
        if (resp.status === 200) {
            const channelEmotes = resp.data
            if (channelEmotes.length !== 0) {
                for (emote of channelEmotes) {
                    bttvFFZSevenEmotes.push({
                        id: emote.id,
                        code: emote.name
                    })
                }
            }

        }
    }).catch(err => {
        console.error(`${dateNow} - An error occurred when tried to fetch the 7TV Global emotes!\n${err}`)
    })

    await axios.get(`${sevenTvApiUrlBase}/users/${broadcasterId}/emotes`).then(resp => {
        if (resp.status === 200) {
            const channelEmotes = resp.data
            if (channelEmotes.length !== 0) {
                for (emote of channelEmotes) {
                    bttvFFZSevenEmotes.push({
                        id: emote.id,
                        code: emote.name
                    })
                }
            }

        }
    }).catch(err => {
        if (err.response == undefined) {
            console.error(`${dateNow} - An error occured when tired to fetch the 7TV Channel emotes and was no possible to track the error!`)
        } else if (err.response.status != 404) {
            console.error(`${dateNow} - An error occurred when tried to fetch the 7TV Channel emotes!\n${err}`)
        }
    })


    console.info(`${dateNow} - Finished fetching BTTV, FFZ and 7TV emotes!`)

}

function extractExternalEmoteLines(emoteId, emoteMessage, message) {

    let result = `${emoteId}:`;
    const emotesInMessage = emotesRepeatedInMessage(message, emoteMessage);


    for (let i = 1; i <= emotesInMessage; i++) {
        const firstPosition = fromIndex(message, emoteMessage, i)
        const secondPostion = (firstPosition + (emoteMessage.length - 1))
        if (i !== 1) {
            result += `,${firstPosition}-${secondPostion}`;
        } else {
            result += `${firstPosition}-${secondPostion}`;
        }

    }

    return result
}

function emotesRepeatedInMessage(message, emoteMessage) {
    let messageSplitted = message.split(" ")

    let counter = 0;
    for (msg of messageSplitted.flat()) {
        if (msg == emoteMessage) {
            counter++
        }
    }

    return counter
}

function fromIndex(str, pat, n) {
    let L = str.length, i = -1;
    while (n-- && i++ < L) {
        i = str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

const getBttvFfzSevenEmotes = () => {
    return bttvFFZSevenEmotes;
}

module.exports = { extractExternalEmoteLines, fetchExternalEmotes, getBttvFfzSevenEmotes, emotesRepeatedInMessage }