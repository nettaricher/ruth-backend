var mongoose = require('mongoose')

var deploy = new mongoose.Schema({
        timeStamp: Number,
        deployId: String,
        coords: Number,
        reportingUserId: String,
        additionalInfo: String,
        deployment: [
            {
                amount: Number,
                tag: String
            }
        ],
        deployType: String
    })

var Deploy = mongoose.model('Deploy', deploy)
module.exports = Deploy