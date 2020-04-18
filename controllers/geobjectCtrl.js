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
    },

    addGeoObject(req, res, next){
        const{
            objectId = null,
            location = null,
            height = null,
            additionalInfo = null,
            tag = null
        } = req.body
        Geobject.find({objectId: objectId})
        .then(result => {
            if (result.length > 0){
                res.status(406).json({message: "Geo Object id is already exist, to update please use /geoObject/update/" + objectId})
            }
            else {
                const geoObject = new Geobject({objectId, location, height, additionalInfo, tag})
                geoObject.save()
                .then(result => {
                    res.status(201).json(result)
                })
                .catch(err => {
                    res.status(404).send(err)
                })
            }
         })
    },

    updateGeoObjectById(req, res, next){

    }
}