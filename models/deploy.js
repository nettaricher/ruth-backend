var mongoose = require('mongoose')

var deploy = new mongoose.Schema({
        deployId: String,
        location: {
            type: { type: String },
            coordinates: [],
            elevation: Number
           },
        prevlocation: {
            type: { type: String },
            coordinates: [],
            elevation: Number
           },
        reportingUserId: String,
        additionalInfo: String,
        amount: Number,
        tag: String,
        deployType: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        nearObject: [],
        is_valid: Boolean,
        objectId: String
    })

deploy.index({ location: "2dsphere" })

var Deploy = mongoose.model('Deploy', deploy)
module.exports = Deploy