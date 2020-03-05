const Geobject = require('../models/geobject')

module.exports = {
    //show all Geobjects
    fetchAllGeobjects(req, res, next){         
        Geobject.find({})
        .then(result => {
            res.json(result)
        }) 
        .catch( err => {
            res.status(404).send("not found")
        })
    }
}