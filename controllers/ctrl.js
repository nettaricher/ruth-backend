const Deploy = require('../models/deploy')
const io = require('../utils/socketIO');
module.exports = {
    //show all DeployIntell
    fetchAllDeploy(req, res, next){
        Deploy.find({is_valid: true})
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
            prevlocation = null,
            reportingUserId = null,
            additionalInfo = null,
            deployment = null,
            deployType = null
        } = req.body
        const is_valid = true
        const deploy = new Deploy({deployId, location, prevlocation, reportingUserId, additionalInfo, deployment, deployType, is_valid})
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
            },
            is_valid: true
           })
           .find((error, results) => {
            if (error) console.log(error);
            res.json(results)
           })
    },

    updateDeployById(req,res,next){
        const {id = null} = req.params
        const {location = null} = req.body
        let prev = null;
        Deploy.findOne({deployId: id, is_valid: true})
            .then(deploy => {
                Deploy.updateOne({deployId: id, is_valid: true}, {is_valid: false})
                .then(result => {
                    console.log(result)
                })
                const newDeploy = new Deploy({
                    deployId: deploy.deployId,
                    location: location,
                    prevlocation: deploy.location,
                    reportingUserId: deploy.reportingUserId,
                    additionalInfo: deploy.additionalInfo,
                    deployment: deploy.deployment,
                    deployType: deploy.deployType,
                    is_valid: true
                })
                newDeploy.save()
                .then(result => {
                    Deploy.findOne({deployId: id, is_valid: true})
                    .then(deploy => {
                        io.getio().emit("SEND_LOCATION", deploy)
                        res.json(deploy)
                    })   
                })
            })   
        .catch(err => {
            res.status(404).send("not found")
        }) 
    }
}