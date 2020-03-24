const Deploy = require('../models/deploy')
const io = require('../utils/socketIO');
module.exports = {
    //show all DeployIntell
    fetchAllDeploy(req, res, next){
        Deploy.find({})
        .then(result => {
            res.json(result)
        })
        .catch( err => {
            res.status(404).send("not found")
        })
    },

    addDeploy(req,res,next){
        const{
            deployId = null,
            location = null,
            reportingUserId = null,
            additionalInfo = null,
            deployment = null,
            deployType = null
        } = req.body
        const deploy = new Deploy({deployId, location, reportingUserId, additionalInfo, deployment, deployType})
        deploy.save()
        .then(result => {
            io.getio().emit("SEND_LOCATION", deploy)
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(404).send(err)
        })
    },

    fetchDeployByLocation(req,res,next){
        const {
             long = null,
             latt = null
        } = req.body
        Deploy.find({
            location: {
             $near: {
              $maxDistance: 10000,
              $geometry: {
               type: "Point",
               coordinates: [long, latt]
              }
             }
            }
           })
           .find((error, results) => {
            if (error) console.log(error);
            res.json(results)
           })
    },

    updateDeployById(req,res,next){
        const {id = null} = req.params
        const {location = null} = req.body
        Deploy.updateOne({deployId: id}, {location: location})
        .then(result => {
            console.log("Deploy updated!")
            res.json(result)
        }) 
        .catch(err => {
            res.status(404).send("not found")
        }) 
    }
}