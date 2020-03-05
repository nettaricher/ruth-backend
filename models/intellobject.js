var mongoose = require('mongoose')

var intellobject = new mongoose.Schema({
        timeStamp: Number,
        objectId: String,
        coords: Number,
        radius: Number,
        height: Number,
        reportingUserId: String,
        additionalInfo: String,
        tag: [String],
        deployment: [
            {
                amount: Number,
                tag: String
            }
        ]
    })

var Intellobject = mongoose.model('Intellobject', intellobject)
module.exports = Intellobject