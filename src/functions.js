require('dotenv/config');
const axios = require("axios").default;

const { extractExternalEmoteLines, getBttvFfzSevenEmotes, emotesRepeatedInMessage } = require("./bttvFFZRequests")

async function sendMessageToAnalyse(analyseObject) {

    const apiUrlBase = process.env.API_URL_BASE
    const token = process.env.API_TOKEN;
    const config = {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }

    await axios.post(`${apiUrlBase}/v1/user-message/analyse`, analyseObject, config).then(response => {

        if (response.status === 200) {
            console.info(`Sent ${analyseObject.displayName}'s message to analyse!`)
        }

    }).catch((e) => {
        console.error(`An error ocurred \n${e}`);
    })

}

async function extractContextInformations(context, message) {
    let subscriptionTime = 0
    let emotes = []
    let emoteOnly = false
    const isSubscriber = context.subscriber
    let subscritionTier = 0;

    if (isSubscriber) {
        subscriptionTime = context['badge-info'].subscriber
    }
    if (context['emotes-raw'] != null) {
        emotes = context['emotes-raw'].split("/")
    }

    if (context['emote-only'] != null) {
        emoteOnly = context['emote-only']
    }

    if (context.badges != null && context.badges.subscriber != null) {
        if (!isNaN(context.badges.subscriber) && context.badges.subscriber >= 1000) {
            subscritionTier = Math.floor(context.badges.subscriber / 1000);
        } else {
            subscritionTier = 1
        }
    }

    const receivedMessage = message.toLowerCase();
    const username = context.username;
    const displayName = context['display-name'];
    const userId = context['user-id'];

    emotes.push(await extractEmotesInMessage(message))

    const messageAnalyseObject = {
        displayName: displayName,
        emoteOnly: emoteOnly,
        emotes: emotes.flat(),
        message: receivedMessage,
        subscriber: isSubscriber,
        subscriptionTier: subscritionTier,
        subscriptionTime: parseInt(subscriptionTime),
        userId: parseInt(userId),
        username: username
    }

    return messageAnalyseObject;

}

function extractEmotesInMessage(message) {
    let emotesArray = []

    for (emote of getBttvFfzSevenEmotes()) {

        const emotesRepeated = emotesRepeatedInMessage(message, emote.code)

        if (emotesRepeated > 0) {
            
            emotesArray.push(extractExternalEmoteLines(emote.id, emote.code, message))
        }
    }

    return emotesArray
}

module.exports = { extractContextInformations, sendMessageToAnalyse }