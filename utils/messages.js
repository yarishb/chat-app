const moment = require("moment")

function formatMassage(username, text){
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMassage;