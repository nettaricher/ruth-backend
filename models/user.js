var mongoose = require('mongoose')

var user = new mongoose.Schema({
        id: String,
        firstName: String,
        lastName: String,
        rank: String,
        role: {
            name: String,
            description: String
        },
        fieldAgent: {
            coords: Number,
            totalAgents: Number,
            unit: String
        }
    })

var User = mongoose.model('User', user)
module.exports = User