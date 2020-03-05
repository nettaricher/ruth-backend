const Intellobject = require('../models/intellobject')

module.exports = {
    //show all ObjectsIntell
    fetchAllObjects(req, res, next){         
        Intellobject.find({})
        .then(result => {
            res.json(result)
        }) 
        .catch( err => {
            res.status(404).send("not found")
        })
    }
}