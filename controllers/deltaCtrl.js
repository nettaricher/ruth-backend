const Delta = require('../models/delta')

module.exports = {
    //show all Deltas
    fetchAllDeltas(req, res, next){         
        Delta.find({})
        .then(result => {
            res.json(result)
        }) 
        .catch( err => {
            res.status(404).send("not found")
        })
    }
}