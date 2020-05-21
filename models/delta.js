var mongoose = require('mongoose')

var delta = new mongoose.Schema({
        deployId: String,
        message: String,
        data: [],
        timestamp: {
            type: Date,
            default: Date.now
        }
    })

var Delta = mongoose.model('Delta', delta)
module.exports = Delta