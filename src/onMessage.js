require('dotenv/config');

const { extractContextInformations, sendMessageToAnalyse } = require("./functions")

const { isStreaming } = require("./twitchRequests")


function messageReceived(target, context, message, ehBot) {

    if (!isStreaming()) {
        console.log("Streamer is offline!")
        return;
    }

    if (ehBot) {
        return;
    }

    if (message.startsWith("!")) {
        return;
    }

    const messageToAnalyseObject = extractContextInformations(context, message)

    sendMessageToAnalyse(messageToAnalyseObject)
}

module.exports = messageReceived;