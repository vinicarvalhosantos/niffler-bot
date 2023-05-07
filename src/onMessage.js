require('dotenv/config');

const { extractContextInformations, sendMessageToTheQueue } = require("./functions")

const { isStreaming } = require("./twitchRequests")

const dateNow = require("./date")


async function messageReceived(target, context, message, ehBot) {

    /*if (!isStreaming()) {
        //console.log(`${dateNow} - Streamer is offline!`)
        return;
    }*/

    if (ehBot) {
        return;
    }

    if (message.startsWith("!")) {
        return;
    }

    const messageToAnalyseObject = await extractContextInformations(context, message)

    sendMessageToTheQueue(messageToAnalyseObject)
}

module.exports = messageReceived;