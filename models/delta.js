var mongoose = require('mongoose')

var delta = new mongoose.Schema({
        timeStamp: Date,
        Id: String,
        // relatedReports: Array,
        distanceDelta: Number,
        // deployDelta: Array,
        priority: Number
    })

var Delta = mongoose.model('Delta', delta)
module.exports = Delta