require('dotenv/config');
const axios = require("axios").default;
const AWS = require("aws-sdk")
const dateNow = require("./date")
const emoji = require("node-emoji")

AWS.config.update({ region: "sa-east-1" })
AWS.config.update({ credentials: { accessKeyId: process.env.AWS__ACCESS_KEY, secretAccessKey: process.env.AWS__SECRET_KEY } })

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

const { extractExternalEmoteLines, getBttvFfzSevenEmotes, emotesRepeatedInMessage } = require("./bttvFFZRequests")


/**
 * @deprecated
 * @param {*} analyseObject 
 */
async function sendMessageToAnalyse(analyseObject) {

    const apiUrlBase = process.env.API_URL_BASE
    const token = process.env.API_TOKEN;
    const config = {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }

    await axios.post(`${apiUrlBase}/v2/user-message/analyse`, analyseObject, config).then(response => {

        if (response.status === 200) {
            console.info(`${dateNow()} - Sent ${analyseObject.displayName}'s message to analyse!`)
        }

    }).catch((e) => {
        console.error(`${dateNow} - An error ocurred -- \n${e}`);
    })

}

async function sendMessageToTheQueue(analyseObject) {
    const message = {
        MessageBody: JSON.stringify(analyseObject),
        MessageDeduplicationId: `user-message-analyse-${analyseObject.userId}-${new Date().getMilliseconds()}`,
        MessageGroupId: "USER-MESSAGE-ANALYSE",
        QueueUrl: process.env.SQS_URL
    }

    sqs.sendMessage(message, function (err, data) {
        if (err) {
            console.log(`${dateNow} - An error occurred when tried to send the user message to the queue. Error: \n`, err)
        } else {
            console.log(`${dateNow} - User message sent to the queue!`, `(MessageId: ${data.MessageId})`)
        }
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

    const receivedMessage = emoji.replace(message.toLowerCase(), () => `.`)
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
        username: username,
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


module.exports = { extractContextInformations, sendMessageToAnalyse, sendMessageToTheQueue }