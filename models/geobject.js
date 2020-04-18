var mongoose = require('mongoose')

var geobject = new mongoose.Schema({
        objectId: String,
        location: {
            type: { type: String },
            coordinates: [],
            elevation: Number
        },
        height: Number,
        additionalInfo: String,
        tag: [String]
    })

var Geobject = mongoose.model('Geobject', geobject)
module.exports = Geobject