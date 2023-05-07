const moment = require("moment/moment")

const dateNow = () => {
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
}

module.exports = dateNow()